package client

import (
	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
)

type Prime interface {
	SendArtifacts(id query.ID, path value.ArtifactsArchive) error
}
