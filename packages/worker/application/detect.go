package application

import (
	"github.com/kk-mats/ccx-worker/domain/repository/client"
	"github.com/kk-mats/ccx-worker/domain/repository/filesystem"
	"github.com/kk-mats/ccx-worker/domain/service"
)

type Detect struct {
	s *service.Detect
}

func NewDetect(
	wr filesystem.Workspace, pr filesystem.Plugin, pc client.Prime, cc client.Container) *Detect {
	return &Detect{
		s: service.NewDetect(wr, pr, pc, cc),
	}
}
