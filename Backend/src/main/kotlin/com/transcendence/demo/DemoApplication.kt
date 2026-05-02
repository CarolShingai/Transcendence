package com.transcendence.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication(scanBasePackages = ["com.transcendence"])
class DemoApplication


fun main(args: Array<String>) {
	runApplication<DemoApplication>(*args)
}
