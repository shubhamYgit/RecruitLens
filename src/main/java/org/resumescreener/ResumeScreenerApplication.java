package org.resumescreener;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ResumeScreenerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResumeScreenerApplication.class, args);
    }
}
