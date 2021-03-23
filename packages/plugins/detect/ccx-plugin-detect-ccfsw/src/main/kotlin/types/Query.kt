package com.github.kk_mats.ccx_plugin_detect_ccfsw.types

import kotlinx.serialization.Serializable

@Serializable
data class Target(val revision: String, val directory: String)

@Serializable
data class Query(val detectorVersion: String, val targets: List<Target>, val parameters: Parameters)
