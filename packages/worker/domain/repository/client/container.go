package client

import (
	"context"

	"github.com/kk-mats/ccx-worker/domain/object/plugin"
	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
)

type Container interface {
	Build(ctx context.Context, tag string, compressed plugin.TarReader) error

	Create(ctx context.Context, id query.ID, tag string, workspace value.WorkspaceRoot) (string, error)

	Start(ctx context.Context, id string) error

	Remove(ctx context.Context, id string) error

	CopyWorkspaceToContainer(ctx context.Context, id string, workspace value.WorkspaceArchive) error

	CopyArtifactsFromContainer(ctx context.Context, id string) (value.ArtifactsArchiveWithoutLogs, error)

	Wait(ctx context.Context, id string) (plugin.StatusCode, error)

	FetchLogs(ctx context.Context, id string) (plugin.Logs, error)

	Kill(ctx context.Context, id string) error

	OSType() *value.WorkerType
}
