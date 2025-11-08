document.addEventListener('DOMContentLoaded', function() {
    const pasteArea = document.getElementById('pasteArea');
    const statusDiv = document.getElementById('status');
    const formatButtons = document.querySelectorAll('.format-btn');
    
    let currentFormat = 'png';
  

    formatButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        formatButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFormat = this.dataset.format;
      });
    });
  

    pasteArea.focus();
  
    
    pasteArea.addEventListener('paste', function(e) {
      e.preventDefault();
      handlePaste(e);
    });
  
 
    document.addEventListener('paste', function(e) {
      e.preventDefault();
      handlePaste(e);
    });
  
    function handlePaste(e) {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      let imageFound = false;
      
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          imageFound = true;
          const blob = item.getAsFile();
          
    
          const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .slice(0, -5);
          const fileName = `image_${timestamp}`;
          
          convertAndSaveImage(blob, fileName, currentFormat);
          break;
        }
      }
      
      if (!imageFound) {
        showStatus('❌ No image in clipboard', 'error');
      }
    }
  
    function convertAndSaveImage(blob, fileName, format) {
      showStatus('⏳ Processing...', 'info');
      
      const img = new Image();
      const url = URL.createObjectURL(blob);
      
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        
        let mimeType, fileExtension;
        
        if (format === 'jpeg') {
          mimeType = 'image/jpeg';
          fileExtension = 'jpg';
      
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        } else {
          mimeType = 'image/png';
          fileExtension = 'png';
          ctx.drawImage(img, 0, 0);
        }
        
        canvas.toBlob(function(newBlob) {
          const downloadUrl = URL.createObjectURL(newBlob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `${fileName}.${fileExtension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
          URL.revokeObjectURL(url);
          
          showStatus(`✅ Saved as ${fileExtension.toUpperCase()}!`, 'success');
          
        }, mimeType, format === 'jpeg' ? 0.92 : 1.0);
      };
      
      img.onerror = function() {
        showStatus('❌ Error processing image', 'error');
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    }
  
    function showStatus(message, type) {
      statusDiv.textContent = message;
      statusDiv.className = `status ${type}`;
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        window.close();
      }
    });
  });