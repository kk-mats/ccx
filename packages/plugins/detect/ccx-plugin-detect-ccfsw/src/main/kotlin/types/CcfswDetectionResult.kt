package com.github.kk_mats.ccx_plugin_detect_ccfsw.types

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


@Serializable
class Parameters(
    @SerialName("d") val target: String,
	@SerialName("revision") val revision: String,
    @SerialName("o") val output: String,
    @SerialName("l") val language: String,

    @SerialName("t") val t: Int? = null,
    @SerialName("w") val w: Int? = null,
    @SerialName("b") val b: Boolean? = null,
    @SerialName("antlr") val antlr: String? = null,
    @SerialName("charset") val charset: String? = null,
	
    @SerialName("ccf") val ccf: Boolean? = null,
    @SerialName("ccfx") val ccfx: Boolean? = null,
    @SerialName("ccfsw") val ccfsw: String? = null,
    @SerialName("json") val json: String? = null,

    @SerialName("tks") val tks: Int? = null,
    @SerialName("rnr") val rnr: Float? = null,
) {
    init {
        require(this.t == null || this.t > 0) { "parameters.t must be greater than zero." }
        require(this.tks == null || this.tks > 0) { "parameters.tks must be greater than zero." }
        require(this.rnr == null || (0 < this.rnr && this.rnr <= 1)) { "parameters.rnr must in range from zero to one." }
        require(this.w == null || (0 <= this.w && this.w <= 2)) { "parameters.w must be 0, 1, or 2." }

        require(arrayOf(null, "sjis", "utf8", "euc", "auto").contains(this.charset)) {
            "parameters.charset must be \"sjis\", \"utf8\", \"euc\", or \"auto\"."
        }
        require(arrayOf(null, "pair", "set").contains(this.ccfsw)) { "parameters.ccfsw must be \"pair\", or \"set\"." }
        require(arrayOf(null, "+", "-").contains(this.json)) { "parameters.json must be \"+\" or \"-\"." }
    }
}

@Serializable
data class CcfswFileTable(val id: Int, val path: String)

@Serializable
data class CcfswFragment(@SerialName("file_id") val fileId: Int, val begin: Int, val end: Int)

@Serializable
data class CcfswClonePair(val similarity: Int, val fragment1: CcfswFragment, val fragment2: CcfswFragment)

@Serializable
data class CcfswDetectionResult(
    @SerialName("file_table") val fileTable: List<CcfswFileTable>,
    @SerialName("clone_pairs") val clonePairs: List<CcfswClonePair>
)