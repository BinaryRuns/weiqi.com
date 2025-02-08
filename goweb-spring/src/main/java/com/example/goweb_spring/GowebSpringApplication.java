package com.example.goweb_spring;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
public class GowebSpringApplication {
	public static void main(String[] args) {
		SpringApplication.run(GowebSpringApplication.class, args);
	}
}

