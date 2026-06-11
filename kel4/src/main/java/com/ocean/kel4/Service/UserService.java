package com.ocean.kel4.Service;

import com.ocean.kel4.Entity.User;
import com.ocean.kel4.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public static class RegisterResult {
        public final boolean sukses;
        public final String pesan;

        public RegisterResult(boolean sukses, String pesan) {
            this.sukses = sukses;
            this.pesan = pesan;
        }
    }

    public static class LoginResult {
        public final boolean sukses;
        public final String pesan;
        public final User user;

        public LoginResult(boolean sukses, String pesan, User user) {
            this.sukses = sukses;
            this.pesan = pesan;
            this.user = user;
        }
    }

    public RegisterResult register(String username, String password) {
        if (username == null || username.isBlank())
            return new RegisterResult(false, "Username tidak boleh kosong");
        if (username.length() < 3)
            return new RegisterResult(false, "Username minimal 3 karakter");
        if (password == null || password.length() < 6)
            return new RegisterResult(false, "Password minimal 6 karakter");
        if (userRepository.existsByUsername(username))
            return new RegisterResult(false, "Username sudah digunakan");

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        userRepository.save(user);

        return new RegisterResult(true, "Registrasi berhasil");
    }

    public LoginResult login(String username, String password) {
        if (username == null || password == null)
            return new LoginResult(false, "Username dan password wajib diisi", null);

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty())
            return new LoginResult(false, "Username atau password salah", null);

        User user = userOpt.get();
        if (!user.getPassword().equals(password))
            return new LoginResult(false, "Username atau password salah", null);

        return new LoginResult(true, "Login berhasil", user);
    }
}