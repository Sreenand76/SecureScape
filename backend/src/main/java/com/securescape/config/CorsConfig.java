package com.securescape.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public CorsFilter corsFilter() {

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        CorsConfiguration config = new CorsConfiguration();

        // Production frontend
        config.addAllowedOrigin(frontendUrl);

        // Local development
        config.addAllowedOrigin("http://localhost:3000");

        // CSRF demo/testing
        config.addAllowedOrigin("http://localhost:8081");
        config.addAllowedOrigin("http://127.0.0.1:5500");

        config.setAllowCredentials(true);
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
