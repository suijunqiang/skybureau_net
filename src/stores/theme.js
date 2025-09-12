import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Theme state
  const currentTheme = ref('default')
  
  // Available themes
  const themes = {
    default: {
      name: 'default',
      label: 'Classic Style',
      labelZh: '经典风格',
      colors: {
        // Based on WelcomePage.vue and LoginRegister.vue existing styles
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        surface: '#ffffff',
        text: '#2c3e50',
        textLight: '#6c757d',
        border: '#e1e8ed',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8'
      },
      components: {
        card: {
          background: '#ffffff',
          borderRadius: '16px',
          shadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0'
        },
        button: {
          borderRadius: '8px',
          shadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        },
        input: {
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          background: '#ffffff'
        }
      }
    },
    tech: {
      name: 'tech',
      label: 'Tech Style',
      labelZh: '科技风格',
      colors: {
        // Tech/Sci-fi theme with dark colors and neon accents
        primary: '#00ffff',
        secondary: '#ff0080',
        accent: '#00ff00',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        surface: 'rgba(22, 33, 62, 0.9)',
        text: '#ffffff',
        textLight: '#a0a0a0',
        border: '#00ffff',
        success: '#00ff41',
        warning: '#ffff00',
        error: '#ff0055',
        info: '#00d4ff'
      },
      components: {
        card: {
          background: 'rgba(26, 26, 46, 0.9)',
          borderRadius: '4px',
          shadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          border: '1px solid #00ffff'
        },
        button: {
          borderRadius: '4px',
          shadow: '0 0 10px rgba(0, 255, 255, 0.5)'
        },
        input: {
          borderRadius: '4px',
          border: '1px solid #00ffff',
          background: 'rgba(26, 26, 46, 0.8)'
        }
      }
    }
  }

  // Computed properties
  const theme = computed(() => themes[currentTheme.value])
  const isDefault = computed(() => currentTheme.value === 'default')
  const isTech = computed(() => currentTheme.value === 'tech')

  // Actions
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      currentTheme.value = themeName
      applyThemeToDocument()
      // Save to localStorage
      localStorage.setItem('skybureau-theme', themeName)
      
      // Force immediate re-render of all components
      setTimeout(() => {
        // Force reflow on all elements
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          el.style.transform = 'translateZ(0)';
          el.offsetHeight; // Trigger reflow
          el.style.transform = '';
        });
        
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('skybureau-theme-changed', { 
          detail: { theme: themeName } 
        }));
      }, 10);
    }
  }

  const applyThemeToDocument = () => {
    console.log('Applying theme:', currentTheme.value);
    const root = document.documentElement
    const body = document.body
    const themeData = themes[currentTheme.value]
    
    // Force remove all existing theme classes
    body.className = body.className.replace(/theme-\w+/g, '')
    
    // Apply theme class immediately with highest priority
    body.classList.add(`theme-${currentTheme.value}`)
    console.log('Applied theme class:', `theme-${currentTheme.value}`);
    
    // Apply CSS custom properties with !important
    Object.entries(themeData.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value, 'important')
    })
    
    // Apply component styles with !important
    Object.entries(themeData.components).forEach(([component, styles]) => {
      Object.entries(styles).forEach(([property, value]) => {
        root.style.setProperty(`--theme-${component}-${property}`, value, 'important')
      })
    })
    
    // Force immediate background change on body and main containers
    if (currentTheme.value === 'tech') {
      body.style.setProperty('background', 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', 'important')
      body.style.setProperty('color', '#00ffff', 'important')
      body.style.setProperty('font-family', 'Courier New, monospace', 'important')
      console.log('Applied tech theme styles');
    } else {
      body.style.setProperty('background', 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 'important')
      body.style.setProperty('color', '#1a1a1a', 'important')
      body.style.setProperty('font-family', 'inherit', 'important')
      console.log('Applied default theme styles');
    }
    
    // Force layout update
    const layouts = document.querySelectorAll('.q-layout, #q-app')
    layouts.forEach(layout => {
      if (currentTheme.value === 'tech') {
        layout.style.setProperty('background', 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', 'important')
      } else {
        layout.style.setProperty('background', 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 'important')
      }
    })
    
    // Force immediate DOM update with highest priority
    setTimeout(() => {
      // Force reflow on all elements
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        // Apply theme-specific styles directly
        if (currentTheme.value === 'tech') {
          // Force tech theme styles on key elements
          if (el.classList && el.classList.contains('theme-header-bar')) {
            el.style.setProperty('background', 'rgba(26, 26, 46, 0.95)', 'important');
            el.style.setProperty('color', '#00ffff', 'important');
            el.style.setProperty('border-bottom', '1px solid rgba(0, 255, 255, 0.3)', 'important');
            el.style.setProperty('box-shadow', '0 1px 10px rgba(0, 255, 255, 0.2)', 'important');
          }
        } else {
          // Force default theme styles on key elements
          if (el.classList && el.classList.contains('theme-header-bar')) {
            el.style.setProperty('background', '#ffffff', 'important');
            el.style.setProperty('color', '#2c3e50', 'important');
            el.style.setProperty('border-bottom', '1px solid #e0e0e0', 'important');
            el.style.setProperty('box-shadow', 'none', 'important');
          }
        }
      });
      
      document.dispatchEvent(new CustomEvent('theme-changed', { detail: currentTheme.value }));
    }, 0);
    
    // Additional force update after a short delay
    setTimeout(() => {
      body.style.display = 'none';
      body.offsetHeight // Force reflow
      body.style.display = '';
    }, 50);
  }

  const initializeTheme = () => {
    // Load from localStorage or use default
    const savedTheme = localStorage.getItem('skybureau-theme')
    if (savedTheme && themes[savedTheme]) {
      currentTheme.value = savedTheme
    }
    applyThemeToDocument()
  }

  return {
    currentTheme,
    themes,
    theme,
    isDefault,
    isTech,
    setTheme,
    applyThemeToDocument,
    initializeTheme
  }
})