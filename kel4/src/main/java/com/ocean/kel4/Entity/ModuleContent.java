package com.ocean.kel4.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "module_contents")
public class ModuleContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @Column(name = "section_order")
    private Integer sectionOrder;

    @Column(name = "content_type")
    private String contentType;

    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    public ModuleContent() {}

    // Getters
    public Long getId() { return id; }
    public Long getModuleId() { return moduleId; }
    public Integer getSectionOrder() { return sectionOrder; }
    public String getContentType() { return contentType; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getImageUrl() { return imageUrl; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
    public void setSectionOrder(Integer sectionOrder) { this.sectionOrder = sectionOrder; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public void setTitle(String title) { this.title = title; }
    public void setContent(String content) { this.content = content; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}