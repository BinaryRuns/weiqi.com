package com.example.goweb_spring.mapper;

import com.example.goweb_spring.dto.UserSettingsDto;
import com.example.goweb_spring.entities.UserSettingsEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserSettingsMapper {
    // Map username/email from nested UserEntity
    @Mapping(source = "user.username", target = "username") // Requires Lombok getters
    @Mapping(source = "user.email", target = "email")
    UserSettingsDto toDto(UserSettingsEntity entity);

    // Ignore fields that should not be updated
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updateEntityFromDto(UserSettingsDto dto, @MappingTarget UserSettingsEntity entity);
}
