package com.example.goweb_spring.aspects;

import com.example.goweb_spring.utils.SecurityUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * Aspect that handles authentication checks for methods annotated with @RequiresAuthentication.
 * This aspect will intercept calls to these methods and ensure the user is authenticated
 * before allowing the method to execute.
 */
@Aspect
@Component
public class AuthenticationAspect {

    private final SecurityUtils securityUtils;

    public AuthenticationAspect(SecurityUtils securityUtils) {
        this.securityUtils = securityUtils;
    }

    /**
     * Intercepts calls to methods annotated with @RequiresAuthentication and checks if the user is authenticated.
     * If the user is not authenticated, it throws an IllegalStateException that will be handled by
     * AuthenticationAdvice to return a 401 Unauthorized response.
     *
     * @param joinPoint The join point representing the intercepted method call
     * @return The result of the method execution if authentication is successful
     * @throws Throwable If authentication fails or if the method execution throws an exception
     */
    @Around("@annotation(com.example.goweb_spring.annotations.RequiresAuthentication) || " +
            "@within(com.example.goweb_spring.annotations.RequiresAuthentication)")
    public Object checkAuthentication(ProceedingJoinPoint joinPoint) throws Throwable {
        // This will throw an IllegalStateException if not authenticated
        securityUtils.requireUserId();
        
        // If we get here, the user is authenticated, so proceed with the method execution
        return joinPoint.proceed();
    }
}