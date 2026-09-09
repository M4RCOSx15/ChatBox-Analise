package com.oriento.api.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        Long expiresIn,
        UsuarioResponse usuario
) {
}
