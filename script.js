// 粒子背景效果
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 粒子系统
class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

const particles = [];
for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // 连接附近的粒子
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 100)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    
    requestAnimationFrame(animateParticles);
}

animateParticles();

// 头像上传功能
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');

avatarInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            avatarPreview.src = e.target.result;
            avatarPreview.style.display = 'block';
            // 保存到本地存储
            localStorage.setItem('avatar', e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// 加载保存的头像
window.addEventListener('DOMContentLoaded', function() {
    const savedAvatar = localStorage.getItem('avatar');
    if (savedAvatar) {
        avatarPreview.src = savedAvatar;
        avatarPreview.style.display = 'block';
    }
});

// 保存数据功能 - 只保存到网页（localStorage）
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const sectorContents = document.querySelectorAll('.sector-content');

saveBtn.addEventListener('click', function() {
    const data = {
        avatar: localStorage.getItem('avatar') || '',
        sectors: {}
    };
    
    sectorContents.forEach((content) => {
        const sectorTitle = content.closest('.sector-card').querySelector('.sector-title').textContent;
        data.sectors[sectorTitle] = content.value;
    });
    
    // 保存到本地存储
    localStorage.setItem('researchData', JSON.stringify(data));
    
    // 显示保存成功提示
    showNotification('数据已保存到网页！', 'success');
});

// 清除功能 - 只清除文本框内容
clearBtn.addEventListener('click', function() {
    if (confirm('确定要清除所有文本框内容吗？')) {
        // 只清空所有文本区域，保留头像
        sectorContents.forEach(content => {
            content.value = '';
        });
        
        // 更新本地存储（保留头像，清除文本）
        const data = {
            avatar: localStorage.getItem('avatar') || '',
            sectors: {}
        };
        localStorage.setItem('researchData', JSON.stringify(data));
        
        showNotification('文本框内容已清除！', 'success');
    }
});

// 自动保存功能（每30秒自动保存到本地存储）
setInterval(function() {
    const data = {
        avatar: localStorage.getItem('avatar') || '',
        sectors: {}
    };
    
    sectorContents.forEach((content) => {
        const sectorTitle = content.closest('.sector-card').querySelector('.sector-title').textContent;
        data.sectors[sectorTitle] = content.value;
    });
    
    localStorage.setItem('researchData', JSON.stringify(data));
}, 30000);

// 页面加载时自动恢复数据
window.addEventListener('DOMContentLoaded', function() {
    const savedData = localStorage.getItem('researchData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // 恢复头像
            if (data.avatar) {
                avatarPreview.src = data.avatar;
                avatarPreview.style.display = 'block';
            }
            
            // 恢复板块内容
            if (data.sectors) {
                sectorContents.forEach(content => {
                    const sectorTitle = content.closest('.sector-card').querySelector('.sector-title').textContent;
                    if (data.sectors[sectorTitle]) {
                        content.value = data.sectors[sectorTitle];
                    }
                });
            }
        } catch (error) {
            console.error('恢复数据失败:', error);
        }
    }
});

// 通知提示功能
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(255, 0, 0, 0.9)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        z-index: 1000;
        font-family: 'Rajdhani', sans-serif;
        font-size: 16px;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

