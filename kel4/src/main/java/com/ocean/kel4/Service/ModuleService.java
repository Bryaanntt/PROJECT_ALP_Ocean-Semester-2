package com.ocean.kel4.Service;

import com.ocean.kel4.Entity.LearningModule;
import com.ocean.kel4.Entity.ModuleContent;
import com.ocean.kel4.Repository.ModuleRepository;
import com.ocean.kel4.Repository.ModuleContentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleContentRepository moduleContentRepository;

    public ModuleService(ModuleRepository moduleRepository, 
                        ModuleContentRepository moduleContentRepository) {
        this.moduleRepository = moduleRepository;
        this.moduleContentRepository = moduleContentRepository;
    }

    public List<LearningModule> getAllModules() {
        return moduleRepository.findAll();
    }

    public LearningModule getModuleById(Long id) {
        return moduleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Module tidak ditemukan dengan ID: " + id));
    }

    public List<ModuleContent> getModuleContents(Long moduleId) {
        return moduleContentRepository.findByModuleIdOrderBySectionOrder(moduleId);
    }

    @Transactional
    public LearningModule createModule(LearningModule module) {
        return moduleRepository.save(module);
    }

    @Transactional
    public LearningModule updateModule(Long id, LearningModule moduleDetails) {
        LearningModule module = getModuleById(id);
        module.setTitle(moduleDetails.getTitle());
        module.setDescription(moduleDetails.getDescription());
        module.setThumbnail(moduleDetails.getThumbnail());
        return moduleRepository.save(module);
    }

    @Transactional
    public void deleteModule(Long id) {
        moduleRepository.deleteById(id);
    }

    public boolean moduleExists(Long id) {
        return moduleRepository.existsById(id);
    }
}