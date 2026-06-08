package com.ocean.kel4.Controller;

import com.ocean.kel4.Entity.LearningModule;
import com.ocean.kel4.Entity.ModuleContent;
import com.ocean.kel4.Service.ModuleService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = "*")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @GetMapping
    public List<LearningModule> getAllModules() {
        return moduleService.getAllModules();
    }

    @GetMapping("/{id}")
    public LearningModule getModuleById(@PathVariable Long id) {
        return moduleService.getModuleById(id);
    }

    @GetMapping("/{id}/contents")
    public List<ModuleContent> getModuleContents(@PathVariable Long id) {
        return moduleService.getModuleContents(id);
    }

    @PostMapping
    public LearningModule createModule(@RequestBody LearningModule module) {
        return moduleService.createModule(module);
    }

    @PutMapping("/{id}")
    public LearningModule updateModule(@PathVariable Long id, @RequestBody LearningModule module) {
        return moduleService.updateModule(id, module);
    }

    @DeleteMapping("/{id}")
    public void deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
    }
}