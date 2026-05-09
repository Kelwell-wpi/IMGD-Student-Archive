<template>
    <h2>Tutorial Content</h2>
    <div class="tutorial-content" v-html="sanitizedHtml"></div>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import DOMPurify from 'dompurify';

  const props = defineProps(['path']);
  const sanitizedHtml = ref('');

  const htmlModules = import.meta.glob('/src/archive/**/*.html', { 
    query: '?raw', 
    import: 'default', 
    eager: true 
  });

  const imageModules = import.meta.glob('/src/archive/**/*.{png,jpg,jpeg,gif,webp}', { 
    eager: true, 
    import: 'default' 
  });

  const loadTutorial = () => {
    if (!props.path) {
      sanitizedHtml.value = "<p>No tutorial path provided.</p>";
      return;
    }

    const normalizedSearchPath = props.path.toLowerCase().replace(/\/+$/, ''); 
    
    const actualKey = Object.keys(htmlModules).find(key => {
      const lowerKey = key.toLowerCase();
      return lowerKey.includes(`/${normalizedSearchPath}/`) && lowerKey.endsWith('.html');
    });

    const rawText = htmlModules[actualKey];

    if (!rawText) {
      console.group("Tutorial Search Debugger");
      console.error("Target Folder Path:", props.path);
      console.log("Normalized Search String:", normalizedSearchPath);
      console.log("All Available HTML Keys:", Object.keys(htmlModules));
      console.groupEnd();
      sanitizedHtml.value = "<p>Tutorial HTML file not found in the specified directory.</p>";
      return;
    }

    try {
      const bodyMatch = rawText.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      let content = bodyMatch ? bodyMatch[1] : rawText;

      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const images = doc.querySelectorAll('img');

      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && (src.startsWith('images/') || src.includes('/images/'))) {
          const imageName = src.split('/').pop();
          const fullImagePath = `/src/archive/${props.path}/images/${imageName}`.replace(/\/+/g, '/');
          const viteImageKey = Object.keys(imageModules).find(key => 
            key.toLowerCase() === fullImagePath.toLowerCase()
          );

          if (viteImageKey) {
            img.src = imageModules[viteImageKey];
          }
        }
      });

      sanitizedHtml.value = DOMPurify.sanitize(doc.body.innerHTML);
    } catch (err) {
      console.error("Error parsing tutorial content:", err);
      sanitizedHtml.value = "<p>Error rendering tutorial content.</p>";
    }
  };

  onMounted(loadTutorial);
  watch(() => props.path, loadTutorial);
</script>

<style scoped>
  .tutorial-content {
    text-align: left;
    max-width: 900px;
    margin: 0 auto;
  }

  .tutorial-content :deep(h1) {
      font-size: 36px;
      font-weight: 700;
  }

  .tutorial-content :deep(img) {
    width: 100%;
    height: auto;
    border: 1px solid #efefef;
    margin-inline: auto;
    margin-bottom: 45px;
    border-radius: 4px;
    display: block;
  }


  .tutorial-content :deep(p) {
    line-height: 1.4;
    margin-bottom: 30px;
    color: #333;
    font-size: 16px;
  }

  .tutorial-content :deep(p:has(img)) {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .tutorial-content :deep(a) {
      color: #AC2B37;
  }

  .tutorial-content :deep(h1), 
  .tutorial-content :deep(h3) {
    margin-bottom: 1.2rem;
    font-weight: 600;
    color: #1a1a1a;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  .tutorial-content :deep(h2) {
    margin-top: 45px;
    margin-bottom: 10px;
    font-weight: 700;
    color: #AC2B37;
  }

  .tutorial-content :deep(h3) {
    margin-top: 60px;
  }

  .tutorial-content :deep(img) {
    margin-top: 50px;
  }


  .tutorial-content :deep(ul), 
  .tutorial-content :deep(ol) {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }

  .tutorial-content :deep(li) {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }
</style>