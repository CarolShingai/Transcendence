package com.transcendence.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication(scanBasePackages = ["com.transcendence.demo"])
class DemoApplication



fun main(args: Array<String>) {
	runApplication<DemoApplication>(*args)
}
