package com.github.kk_mats.ccx_plugin_detect_ccfsw.types

import kotlinx.serialization.Serializable

@Serializable
data class Fragment(val file: String, val begin: Int, val end: Int)

@Serializable
data class ClonePair(var f1: Fragment, var f2: Fragment, val similarity: Float)

@Serializable
data class DetectionResult(val clonePairs: List<ClonePair>)
