package com.ocean.kel4.Controller;

import com.ocean.kel4.Service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody Map<String, String> body,
            HttpSession session) {

        UserService.RegisterResult result = userService.register(
                body.get("username"),
                body.get("password"));

        if (result.sukses) {
            UserService.LoginResult loginResult = userService.login(
                    body.get("username"), body.get("password"));
            if (loginResult.sukses) {
                session.setAttribute("userId", loginResult.user.getId());
                session.setAttribute("username", loginResult.user.getUsername());
            }
        }

        return ResponseEntity.ok(Map.of(
                "sukses", result.sukses,
                "pesan", result.pesan));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> body,
            HttpSession session) {

        UserService.LoginResult result = userService.login(
                body.get("username"),
                body.get("password"));

        if (result.sukses) {
            session.setAttribute("userId", result.user.getId());
            session.setAttribute("username", result.user.getUsername());
        }

        return ResponseEntity.ok(Map.of(
                "sukses", result.sukses,
                "pesan", result.pesan,
                "username", result.sukses ? result.user.getUsername() : ""));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("sukses", true, "pesan", "Logout berhasil"));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(HttpSession session) {
        Object userId = session.getAttribute("userId");
        Object username = session.getAttribute("username");
        boolean loggedIn = userId != null;
        return ResponseEntity.ok(Map.of(
                "loggedIn", loggedIn,
                "username", loggedIn ? username : ""));
    }
}