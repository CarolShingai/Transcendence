
package com.transcendence.demo

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HelloWorld(){
    
    @GetMapping("/hello")
    fun printHello(): String {
        return "Olá mundo!"
    }
}