<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useRoute } from 'vue-router';

  const modules = import.meta.glob('/src/archive/**/*.json', { eager: true });
  
  const buildArchive = () => {
    const list = [];
    for (const path in modules) {
      const data = modules[path]?.default || modules[path];
      if (!data?.author || !data?.projects) continue;

      const pathParts = path.split('/');
      const semesterFolder = pathParts[3];

      data.projects.forEach((proj) => {
        const authorSlug = data.author.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const titleSlug = proj.project_title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const slug = `${authorSlug}-${titleSlug}`;
        
        list.push({
          ...proj,
          id: slug,
          authorName: data.author.name,
          videoUrl: proj.video_file, 
          semesterLabel: proj.semester || semesterFolder
        });
      });
    }
    return list;
  };

  const STATIC_ARCHIVE = buildArchive();

  const route = useRoute();
  const project = ref(null);
  const authorWork = ref([]);

  const syncProject = () => {
    const targetId = route.params.id;
    const found = STATIC_ARCHIVE.find(p => p.id === targetId);
    
    if (found) {
      project.value = found;
      authorWork.value = STATIC_ARCHIVE.filter(p => 
        p.authorName === found.authorName && p.id !== found.id
      );
    } else {
      project.value = null;
      authorWork.value = [];
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getVimeoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url) => {
    const ytId = getYouTubeId(url);
    if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&rel=0`;
    const vimeoId = getVimeoId(url);
    if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1`;
    return url;
  };

  const getThumbnailUrl = (url) => {
    const ytId = getYouTubeId(url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    const vimeoId = getVimeoId(url);
    if (vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;
    return '';
  };

  watch(() => route.params.id, () => {
    syncProject();
  });

  onMounted(() => {
    syncProject();
    window.scrollTo(0, 0);
  });
</script>

<template>
  <div class="page-background">
    <div v-if="project" class="detail-container">
      <div class="main-content">
        <div class="video-wrapper">
          <iframe 
            v-if="getYouTubeId(project.videoUrl) || getVimeoId(project.videoUrl)"
            :src="getEmbedUrl(project.videoUrl)"
            class="hero-media"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          ></iframe>
          
          <video v-else autoplay muted loop controls class="hero-media">
            <source :src="project.videoUrl" type="video/mp4">
          </video>
        </div>
        
        <div v-if="project.blueprint_url" class="blueprint-viewer">
          <h3>Logic & Implementation</h3>
          <iframe :src="project.blueprint_url" width="100%" height="600" scrolling="no" allowfullscreen></iframe>
        </div>

        <div class="project-description">
          <h3>About the Piece</h3>
          <p>{{ project.description }}</p>
        </div>
      </div>

      <aside class="sidebar">
        <div class="sticky-content">
          <header class="project-header">
            <h1>{{ project.project_title }}</h1>
            <p class="author-tag">By {{ project.authorName }}</p>
          </header>
          
          <div class="specs-panel">
            <div class="spec-row">
              <span class="label">Engine</span>
              <span class="value">{{ project.engine_version }}</span>
            </div>
            <div class="spec-row">
              <span class="label">Complexity</span>
              <span class="value">{{ project.instruction_count }} Nodes</span>
            </div>
            <div class="spec-row">
              <span class="label">Semester</span>
              <span class="value">{{ project.semesterLabel }}</span>
            </div>
            <div v-if="project.tags" class="tag-cloud">
              <span v-for="tag in project.tags" :key="tag" class="pill">{{ tag }}</span>
            </div>
          </div>

          <div v-if="authorWork.length > 0" class="related-section">
            <h4>Other Projects by this Researcher</h4>
            <div class="mini-grid">
              <router-link v-for="other in authorWork" :key="other.id" :to="'/project/' + other.id" class="mini-card">
                <img :src="getThumbnailUrl(other.videoUrl)" alt="" />
                <p>{{ other.project_title }}</p>
              </router-link>
            </div>
          </div>

          <router-link to="/" class="nav-back">← Back to Archive</router-link>
        </div>
      </aside>
    </div>

    <div v-else class="empty-state">
      <p>Unable to locate project: <code>{{ $route.params.id }}</code></p>
      <router-link to="/">Return to Archive</router-link>
    </div>
  </div>
</template>

<style scoped>
  .page-background {
    width: 100%;
    min-height: 100vh;
    background-color: #ffffff;
  }

  .detail-container {
    max-width: 1440px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 50px;
    padding: 60px 20px;
    text-align: left;
  }

  .main-content {
    min-width: 0;
  }

  .video-wrapper {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 40px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  }

  .hero-media {
    width: 100%;
    height: 100%;
    display: block;
    border: none;
  }

  .blueprint-viewer {
    margin-bottom: 40px;
    background: #111;
    padding: 20px;
    border-radius: 8px;
  }

  .blueprint-viewer h3 {
    color: #fff;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 15px;
  }

  .project-description h3 {
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }

  .project-description p {
    line-height: 1.7;
    color: #444;
  }

  .sticky-content {
    position: sticky;
    top: 40px;
  }

  .project-header h1 {
    font-size: 2.2rem;
    line-height: 1.1;
    margin: 0 0 10px 0;
    color: #1a1a1a;
  }

  .author-tag {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 30px;
  }

  .specs-panel {
    background: #fcfcfc;
    border: 1px solid #efefef;
    padding: 25px;
    border-radius: 12px;
    margin-bottom: 40px;
  }

  .spec-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 0.9rem;
  }

  .spec-row .label { color: #999; text-transform: uppercase; font-size: 0.75rem; }
  .spec-row .value { font-weight: 600; color: #333; }

  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #eee;
  }

  .pill {
    background: #eee;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.7rem;
    color: #666;
  }

  .related-section h4 {
    font-size: 0.8rem;
    text-transform: uppercase;
    color: #aaa;
    margin-bottom: 20px;
  }

  .mini-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 30px;
  }

  .mini-card {
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease;
  }

  .mini-card:hover { transform: translateY(-3px); }

  .mini-card img {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
    border-radius: 4px;
    background: #000;
  }

  .mini-card p {
    font-size: 0.7rem;
    font-weight: 700;
    margin-top: 8px;
    line-height: 1.3;
  }

  .nav-back {
    display: block;
    color: #888;
    text-decoration: none;
    font-size: 0.9rem;
    margin-top: 20px;
  }

  .empty-state {
    padding: 100px 20px;
    text-align: center;
  }

  @media (max-width: 1024px) {
    .detail-container { grid-template-columns: 1fr; }
    .sidebar { order: 2; }
    .main-content { order: 1; }
  }
</style>