const AppState = {
    moduleData: [],
    currentModuleId: null,
    currentQuiz: null,
    
    setModules(modules) {
        this.moduleData = modules;
    },
    
    getModules() {
        return this.moduleData;
    },
    
    setCurrentModuleId(id) {
        this.currentModuleId = id;
    },
    
    getCurrentModuleId() {
        return this.currentModuleId;
    },
    
    clear() {
        this.moduleData = [];
        this.currentModuleId = null;
        this.currentQuiz = null;
    }
};

window.AppState = AppState;