<script setup>
import { ref, computed } from 'vue';

const modules = import.meta.glob('/public/archive/**/*.json', { eager: true });

// State for Search and Filter
const searchQuery = ref('');
const selectedTag = ref('');

const allProjects = computed(() => {
  const projects = [];
  Object.keys(modules).forEach((path) => {
    const data = modules[path].default || modules[path];
    const pathParts = path.split('/');
    const semester = pathParts[3]; 
    const studentFolder = pathParts[4];
    const assetBase = `/archive/${semester}/${studentFolder}/`;

    if (data.projects) {
      data.projects.forEach((proj, index) => {
        // Create a unique slug for routing: "john-doe-reactive-fire"
        const slug = `${data.author.name}-${proj.project_title}`.toLowerCase().replace(/\s+/g, '-');
        
        projects.push({
          ...proj,
          id: slug,
          authorName: data.author.name,
          videoUrl: `${assetBase}${proj.video_file}`,
          semesterLabel: proj.semester || semester
        });
      });
    }
  });
  return projects;
});

// The Search Logic
const filteredProjects = computed(() => {
  return allProjects.value.filter(p => {
    const searchTerm = searchQuery.value.toLowerCase();
    const matchesSearch = p.project_title.toLowerCase().includes(searchTerm) || 
                          p.authorName.toLowerCase().includes(searchTerm);
    const matchesTag = !selectedTag.value || p.tags.includes(selectedTag.value);
    return matchesSearch && matchesTag;
  });
});

// Extract unique tags for the filter dropdown
const allTags = computed(() => {
  const tags = new Set();
  allProjects.value.forEach(p => p.tags.forEach(t => tags.add(t)));
  return Array.from(tags).sort();
});
</script>

<template>
  <div id="center">
    <header class="gallery-header">
      <div class="counter">VFX Research Archive</div>
      <h1>Student Submissions</h1>
      
      <div class="filter-controls">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by project or author..." 
          class="search-input"
        />
        <select v-model="selectedTag" class="tag-select">
          <option value="">All Specialties</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>
    </header>

    <div class="project-grid">
      <router-link 
        v-for="project in filteredProjects" 
        :key="project.id" 
        :to="'/project/' + project.id"
        class="vfx-card compact"
      >
        <div class="media-container">
          <video muted loop onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0;">
            <source :src="project.videoUrl" type="video/mp4">
          </video>
        </div>

        <div class="card-body">
          <div class="card-meta">
            <h2>{{ project.project_title }}</h2>
            <code class="semester-code">{{ project.semesterLabel }}</code>
          </div>
          <span class="author-subtext">by {{ project.authorName }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.filter-controls {
  display: flex;
  gap: 15px;
  margin-top: 24px;
  justify-content: center;
}

.search-input, .tag-select {
  padding: 10px 15px;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-h);
  font-family: var(--sans);
}

.vfx-card.compact {
  text-decoration: none;
  /* Make cards smaller as requested */
  max-width: 300px; 
}

.vfx-card.compact h2 {
  font-size: 1rem;
  margin: 0;
}

.author-subtext {
  font-size: 0.8rem;
  color: var(--text);
  display: block;
  margin-top: 4px;
}

.media-container video {
  pointer-events: none; /* Prevents controls from showing on hover */
}

/* Ensure the grid handles smaller cards well */
.project-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
</style>