export const configTemplate = `
VGEN_EXEC="$DECKARD_DIR/src"
case $FILE_PATTERN in 
  *.dot )
    VGEN_EXEC="$VGEN_EXEC/dot2d/dotvgen" ;; # for Deckard2 dot only
  *.java )
    VGEN_EXEC="$VGEN_EXEC/main/jvecgen" ;;
  *.php )
    VGEN_EXEC="$VGEN_EXEC/main/phpvecgen" ;;
  *.c | *.h )
    VGEN_EXEC="$VGEN_EXEC/main/cvecgen" ;;
  * )
    echo "Error: invalid FILE_PATTERN: $FILE_PATTERN"
    VGEN_EXEC="$VGEN_EXEC/invalidvecgen" ;;
esac
# how to divide the vectors into groups?
GROUPING_EXEC="$DECKARD_DIR/src/vgen/vgrouping/runvectorsort"
# where is the lsh for vector clustering/querying?
CLUSTER_EXEC="$DECKARD_DIR/src/lsh/bin/enumBuckets"
QUERY_EXEC="$DECKARD_DIR/src/lsh/bin/queryBuckets"
# how to post process clone groups?
POSTPRO_EXEC="$DECKARD_DIR/scripts/clonedetect/post_process_groupfile"
# how to transform source code html? Used by Deckard1 only
SRC2HTM_EXEC=source-highlight 
SRC2HTM_OPTS=--line-number-ref

############################################################
# For parallel processing
#
# the maximal number of processes to be used (by xargs)
# - 0 means as many as possible (upto xargs)
MAX_PROCS=8

##################################################################
# Some additional, internal parameters; can be ignored
#
# the maximal vector size for the first group; not really useful
GROUPING_S='30'  # should be a single value
#GROUPING_D
#GROUPING_C

export DECKARD_DIR
export FILE_PATTERN 
export SRC_DIR
export PDG_DIR
export AST_DIR

export TYPE_FILE
export RELEVANT_NODEFILE
export LEAF_NODEFILE
export PARENT_NODEFILE

export VECTOR_DIR
export TIME_DIR
export CLUSTER_DIR

export VGEN_EXEC
export GROUPING_EXEC
export CLUSTER_EXEC
export POSTPRO_EXEC
export SRC2HTM_EXEC
export SRC2HTM_OPTS

export MIN_TOKENS
export STRIDE
#export DISTANCE
export SIMILARITY
export GROUPING_S
export GROUPING_D
export GROUPING_C

export MAX_PROCS
`;
