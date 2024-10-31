import { backend } from 'declarations/backend';

let quill;

document.addEventListener('DOMContentLoaded', async function() {
    quill = new Quill('#editor', {
        theme: 'snow'
    });

    const newPostBtn = document.getElementById('newPostBtn');
    const newPostForm = document.getElementById('newPostForm');
    const postForm = document.getElementById('postForm');

    newPostBtn.addEventListener('click', () => {
        newPostForm.style.display = newPostForm.style.display === 'none' ? 'block' : 'none';
    });

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const body = quill.root.innerHTML;

        try {
            showLoading();
            await backend.addPost(title, body, author);
            postForm.reset();
            quill.setContents([]);
            newPostForm.style.display = 'none';
            await fetchAndDisplayPosts();
        } catch (error) {
            console.error('Error adding post:', error);
        } finally {
            hideLoading();
        }
    });

    await fetchAndDisplayPosts();
});

async function fetchAndDisplayPosts() {
    try {
        showLoading();
        const posts = await backend.getPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
    } finally {
        hideLoading();
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    posts.sort((a, b) => b.timestamp - a.timestamp).forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'post mb-5';
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p class="text-muted">By ${post.author} on ${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</p>
            <div class="post-content">${post.body}</div>
        `;
        postsContainer.appendChild(postElement);
    });
}

function showLoading() {
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'spinner-border text-primary';
    loadingSpinner.setAttribute('role', 'status');
    loadingSpinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
    document.body.appendChild(loadingSpinner);
}

function hideLoading() {
    const loadingSpinner = document.querySelector('.spinner-border');
    if (loadingSpinner) {
        loadingSpinner.remove();
    }
}
