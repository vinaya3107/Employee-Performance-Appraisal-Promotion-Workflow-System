package com.appraisal.config;

import com.appraisal.model.User;
import com.appraisal.model.enums.Role;
import com.appraisal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Super Admin")
                    .email("admin@company.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .department("Administration")
                    .designation("System Administrator")
                    .joiningDate(LocalDate.now())
                    .build();
            userRepository.save(admin);
            System.out.println("Default ADMIN account created: admin@company.com / admin123");
        }
    }
}
