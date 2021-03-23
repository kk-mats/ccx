package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/kk-mats/ccx-worker/domain/object/value"
	"github.com/kk-mats/ccx-worker/infrastructure/client"
	"github.com/kk-mats/ccx-worker/middleware"
	"github.com/shibukawa/configdir"

	"github.com/kk-mats/ccx-worker/logger"
	"github.com/kk-mats/ccx-worker/presentation/worker"
	"github.com/kk-mats/ccx-worker/registry"
)

func main() {
	logger.Init()

	cc := client.NewContainer()

	g := configure(cc.OSType())

	r := registry.NewRegistry(g, cc)
	defer r.Repository.WorkspaceFilesystem.DeleteAll()

	log.Printf("info: finished to configure ccx-worker: %+v", *g)

	worker.NewWorkerServer(g.Worker.Port, r)

}

func configure(wt *value.WorkerType) *value.GlobalConfig {
	c := initFromArgs()
	log.Printf("debug: config from commandline arguments: %+v", *c)

	return initFromPrime(c, wt)
}

func initFromArgs() *value.CliConfig {
	tmp, err := ioutil.TempDir("", "ccx-worker-cache")
	var c *value.CliConfig

	if err == nil {
		if c, err = value.NewCliConfig(tmp, os.Args); err == nil {
			return c
		}
	}
	log.Fatalf("failed to finish configuration: %s", err.Error())
	return &value.CliConfig{}
}

type received struct {
	Srv   *http.Server
	Prime *value.PrimeConfig
}

func receive(c *value.CliConfig, wt *value.WorkerType, ch chan received) {
	router := gin.New()
	router.Use(gin.LoggerWithFormatter(middleware.Formatter))

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", c.Port),
		Handler: router,
	}

	var p value.PrimeConfig
	router.POST("/", func(ctx *gin.Context) {
		err := ctx.ShouldBindJSON(&p)

		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			log.Fatalf("alert: bad config from controller: %s", err.Error())
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"type": *wt})
		log.Printf("info: received configuration: %+v", p)

		ch <- received{
			Srv:   srv,
			Prime: &p,
		}
	})

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("alert: failed to start configuration server: %s", err.Error())
	}
}

func loadPrimeConfigFromSettinsJson(configDirs configdir.ConfigDir) (*value.PrimeConfig, error) {
	var config value.PrimeConfig

	dir := configDirs.QueryFolderContainsFile("settings.json")
	if dir != nil {
		log.Printf("trace: loaded config from settings.json at %s.", dir.Path)
		data, err := dir.ReadFile("settings.json")
		if err != nil {
			return nil, err
		}

		err = json.Unmarshal(data, &config)
		return &config, err
	}

	log.Printf("trace: settings.json not found.")
	return nil, nil
}

func initFromPrime(c *value.CliConfig, wt *value.WorkerType) *value.GlobalConfig {
	configDirs := configdir.New("ccx", "worker")
	config, err := loadPrimeConfigFromSettinsJson(configDirs)
	if err != nil {
		log.Fatalf("alert: failed to load config: %s", err.Error())
	}

	if config != nil {
		log.Printf("info: skip config reception.")
	} else {
		ch := make(chan received)
		go receive(c, wt, ch)
		r := <-ch

		ctx := context.Background()
		if err := r.Srv.Shutdown(ctx); err != nil {
			log.Fatalf("alert: failed to shutdown configuration server: %s", err.Error())
		}
		log.Printf("trace: shutdowned configuration server on Port %d.", c.Port)

		data, err := json.Marshal(*r.Prime)
		if err != nil {
			log.Fatalf("alert: failed to serialize config object: %s", err.Error())
		}

		dir := configDirs.QueryFolders(configdir.System)[0]
		if err := dir.WriteFile("settings.json", data); err != nil {
			log.Fatalf("alert: failed to write config to settings.json: %s", err.Error())
		}
		log.Printf("info: wrote config to settings.json at %s", dir.Path)
		config = r.Prime
	}

	return value.NewGlobalConfig(*config, c, wt)
}
