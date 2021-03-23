package com.github.kk_mats.ccx_plugin_detect_ccfsw

import java.nio.file.Path
import java.nio.file.Paths
import kotlinx.serialization.*
import kotlinx.serialization.json.*

data class WorkspacePaths(val resources: Path, val artifacts: Path)

fun parse(args: Array<String>): WorkspacePaths {
    val w = Paths.get(args[0]).toAbsolutePath()
    return WorkspacePaths(w.resolve("resources"), w.resolve("artifacts"))
}

fun main(args: Array<String>) {
    val exitCode = try {
        val paths = parse(args)
        val queryJson = paths.resources.resolve("query.json").toFile()
        CcfswController(paths, Json.decodeFromString(queryJson.readText())).exec()
    } catch (e: Exception) {
        println("[plugin] Unhandled exception: ${e.stackTraceToString()}")
        1
    }

    println("[plugin] Finished with exit code ${exitCode}.")
    kotlin.system.exitProcess(exitCode)
}