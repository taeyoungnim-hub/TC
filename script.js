// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initMenuNavigation();
    initButtons();
    initBookmarks();
    initHabits();
    initQuickNote();
    loadSavedData();
});

// 메뉴 네비게이션 초기화
function initMenuNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // 모든 메뉴 아이템에서 active 클래스 제거
            menuItems.forEach(mi => mi.classList.remove('active'));

            // 클릭된 메뉴 아이템에 active 클래스 추가
            this.classList.add('active');

            // 모든 페이지 숨기기
            pages.forEach(page => page.classList.remove('active'));

            // 선택된 페이지 표시
            const pageName = this.getAttribute('data-page');
            const targetPage = document.getElementById(pageName + '-page');
            if (targetPage) {
                targetPage.classList.add('active');
            }

            // 페이지 타이틀 업데이트
            pageTitle.textContent = this.querySelector('.text').textContent;
        });
    });
}

// 버튼 기능 초기화
function initButtons() {
    // 새로고침 버튼
    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', function() {
            const activePage = document.querySelector('.page.active');
            activePage.style.animation = 'none';
            setTimeout(() => {
                activePage.style.animation = 'fadeIn 0.3s';
            }, 10);
            showNotification('페이지가 새로고침되었습니다.');
        });
    }

    // 설정 버튼
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
        btnSettings.addEventListener('click', function() {
            showNotification('설정 기능은 곧 추가될 예정입니다.');
        });
    }

    // 저장 버튼들
    const saveBtns = document.querySelectorAll('.btn-primary');
    saveBtns.forEach(btn => {
        if (btn.textContent.includes('저장')) {
            btn.addEventListener('click', function() {
                saveContent();
            });
        }
    });
}

// 즐겨찾기 기능
function initBookmarks() {
    const bookmarkItems = document.querySelectorAll('.bookmark-item');
    const addBookmarkBtn = document.querySelector('.bookmarks .btn-add');

    // 드래그 앤 드롭 기능
    bookmarkItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });

    // 즐겨찾기 추가
    if (addBookmarkBtn) {
        addBookmarkBtn.addEventListener('click', function() {
            const bookmarkText = prompt('즐겨찾기 이름을 입력하세요:');
            if (bookmarkText) {
                addBookmark(bookmarkText);
            }
        });
    }
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.style.opacity = '0.4';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        const bookmarksContainer = this.parentNode;
        const allBookmarks = [...bookmarksContainer.querySelectorAll('.bookmark-item')];
        const draggedIndex = allBookmarks.indexOf(draggedElement);
        const targetIndex = allBookmarks.indexOf(this);

        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedElement, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedElement, this);
        }
    }

    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    saveBookmarks();
}

function addBookmark(text) {
    const bookmarksContainer = document.querySelector('.bookmarks');
    const addBtn = bookmarksContainer.querySelector('.btn-add');

    const bookmarkItem = document.createElement('div');
    bookmarkItem.className = 'bookmark-item';
    bookmarkItem.draggable = true;
    bookmarkItem.innerHTML = `
        <span class="bookmark-icon">🔖</span>
        <span class="bookmark-text">${text}</span>
    `;

    bookmarkItem.addEventListener('dragstart', handleDragStart);
    bookmarkItem.addEventListener('dragover', handleDragOver);
    bookmarkItem.addEventListener('drop', handleDrop);
    bookmarkItem.addEventListener('dragend', handleDragEnd);

    bookmarksContainer.insertBefore(bookmarkItem, addBtn);
    saveBookmarks();
    showNotification('즐겨찾기가 추가되었습니다.');
}

// 습관 체크박스 기능
function initHabits() {
    const habitCheckboxes = document.querySelectorAll('.habit-item input[type="checkbox"]');

    habitCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateProgress();
            saveHabits();
        });
    });

    // 목표 추가 버튼
    const addGoalBtn = document.querySelector('.self-management .btn-add');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', function() {
            const goalText = prompt('새로운 목표를 입력하세요:');
            if (goalText) {
                addHabit(goalText);
            }
        });
    }

    updateProgress();
}

function updateProgress() {
    const habitCheckboxes = document.querySelectorAll('.habit-item input[type="checkbox"]');
    const checkedCount = document.querySelectorAll('.habit-item input[type="checkbox"]:checked').length;
    const totalCount = habitCheckboxes.length;

    const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');

    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }

    if (progressText) {
        progressText.textContent = percentage + '% 완료';
    }
}

function addHabit(text) {
    const habitList = document.querySelector('.habit-list');

    const habitItem = document.createElement('label');
    habitItem.className = 'habit-item';
    habitItem.innerHTML = `
        <input type="checkbox">
        <span>${text}</span>
    `;

    const checkbox = habitItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function() {
        updateProgress();
        saveHabits();
    });

    habitList.appendChild(habitItem);
    saveHabits();
    updateProgress();
    showNotification('목표가 추가되었습니다.');
}

// 빠른 노트 기능
function initQuickNote() {
    const quickNote = document.querySelector('.quick-note');
    const saveNoteBtn = document.querySelector('.widget .btn-small');

    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', function() {
            saveQuickNote();
            showNotification('노트가 저장되었습니다.');
        });
    }

    // 자동 저장 (5초마다)
    if (quickNote) {
        setInterval(() => {
            saveQuickNote();
        }, 5000);
    }
}

// 로컬 스토리지 저장/로드 기능
function saveContent() {
    const activePageId = document.querySelector('.page.active').id;
    const content = {};

    // 각 페이지의 입력 내용 저장
    const inputs = document.querySelector('.page.active').querySelectorAll('input, textarea');
    inputs.forEach((input, index) => {
        content[`input_${index}`] = input.value;
    });

    localStorage.setItem(activePageId, JSON.stringify(content));
    showNotification('저장되었습니다!');
}

function saveBookmarks() {
    const bookmarks = [];
    document.querySelectorAll('.bookmark-item').forEach(item => {
        const text = item.querySelector('.bookmark-text').textContent;
        bookmarks.push(text);
    });
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function saveHabits() {
    const habits = [];
    document.querySelectorAll('.habit-item').forEach(item => {
        const text = item.querySelector('span').textContent;
        const checked = item.querySelector('input[type="checkbox"]').checked;
        habits.push({ text, checked });
    });
    localStorage.setItem('habits', JSON.stringify(habits));
}

function saveQuickNote() {
    const quickNote = document.querySelector('.quick-note');
    if (quickNote) {
        localStorage.setItem('quickNote', quickNote.value);
    }
}

function loadSavedData() {
    // 빠른 노트 로드
    const savedNote = localStorage.getItem('quickNote');
    const quickNote = document.querySelector('.quick-note');
    if (savedNote && quickNote) {
        quickNote.value = savedNote;
    }

    // 습관 로드
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
        const habits = JSON.parse(savedHabits);
        const habitList = document.querySelector('.habit-list');
        if (habitList && habits.length > 0) {
            habitList.innerHTML = '';
            habits.forEach(habit => {
                const habitItem = document.createElement('label');
                habitItem.className = 'habit-item';
                habitItem.innerHTML = `
                    <input type="checkbox" ${habit.checked ? 'checked' : ''}>
                    <span>${habit.text}</span>
                `;

                const checkbox = habitItem.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', function() {
                    updateProgress();
                    saveHabits();
                });

                habitList.appendChild(habitItem);
            });
            updateProgress();
        }
    }
}

// 알림 표시 함수
function showNotification(message) {
    // 기존 알림이 있으면 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 애니메이션 스타일 추가
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

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S: 저장
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveContent();
    }

    // Ctrl/Cmd + N: 새로고침
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        document.getElementById('btn-refresh').click();
    }
});

console.log('✅ 개인 대시보드가 로드되었습니다!');
console.log('💡 Ctrl/Cmd + S: 저장 | Ctrl/Cmd + R: 새로고침');
