package com.example.goweb_spring.configs;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.example.goweb_spring.filters.SupabaseAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    
    private final SupabaseAuthenticationFilter supabaseAuthenticationFilter;

    public SecurityConfig(SupabaseAuthenticationFilter supabaseAuthenticationFilter) {
        this.supabaseAuthenticationFilter = supabaseAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // More permissive CORS config for webhooks to allow requests from Supabase
        CorsConfiguration webhookConfig = new CorsConfiguration();
        webhookConfig.setAllowedOrigins(List.of("*"));
        webhookConfig.setAllowedMethods(List.of("POST", "OPTIONS"));
        webhookConfig.setAllowedHeaders(List.of("Content-Type", "Accept", "Origin", "X-Requested-With"));
        source.registerCorsConfiguration("/api/webhooks/**", webhookConfig);
        
        // Stricter CORS config for the frontend app
        CorsConfiguration appConfig = new CorsConfiguration();
        appConfig.setAllowedOrigins(List.of("http://localhost:3000", "https://weiqi-frontend.vercel.app"));
        appConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        appConfig.setAllowedHeaders(Arrays.asList("Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", 
                                                   "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        appConfig.setAllowCredentials(true);
        appConfig.setMaxAge(3600L);
        source.registerCorsConfiguration("/**", appConfig);

        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring security filter chain");
        
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for APIs
            .authorizeHttpRequests(auth -> {
                // Public endpoints that don't require authentication
                auth.requestMatchers("/ws/**").permitAll()  // Websocket endpoints are handcled by the user interceptor
                    .requestMatchers("/api/hello/**").permitAll()
                    .requestMatchers("/api/webhooks/**").permitAll()  // Webhook endpoints should be public
                    // OPTIONS requests for CORS pre-flight
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                    
                // Protected endpoints that require authentication
                auth.requestMatchers("/api/auth/**").authenticated() // All auth endpoints require authentication
                    .requestMatchers("/api/game/**").authenticated() // All game endpoints require authentication
                    .requestMatchers("/api/matchmaking/**").authenticated() // All matchmaking endpoints require authentication
                    .requestMatchers("/api/user/settings/**").authenticated(); // All user settings endpoints require authentication
                
                // Default rule: all other requests must be authenticated
                auth.anyRequest().authenticated();
            })
            .addFilterBefore(supabaseAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}