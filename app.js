/** 
    1. Render songs
    2. Scroll top
    3. Play / pause / seek
    4. CD rotate
    5. Next / prev
    6. Random
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const playlist = $(".playlist");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Anh Sai Rồi",
            singer: "Sơn Tùng MTP",
            path: "./assets/music/Anh-Sai-Roi-Son-Tung-M-TP.mp3",
            image: "./assets/img/image-1.jpg",
        },
        {
            name: "Chắc ai đó sẽ về",
            singer: "Sơn Tùng MTP",
            path: "./assets/music/Chac-Ai-Do-Se-Ve.mp3",
            image: "./assets/img/image-2.jpg",
        },
        {
            name: "Chạy ngay đi",
            singer: "Sơn Tùng MTP",
            path: "./assets/music/Chay-Ngay-Di-Son-Tung-M-TP.mp3",
            image: "./assets/img/image-3.jpg",
        },
        {
            name: "Tại vì sao",
            singer: "MCK",
            path: "./assets/music/Tai-Vi-Sao.mp3",
            image: "./assets/img/mck.jpg",
        },
        {
            name: "Tay to",
            singer: "MCK",
            path: "./assets/music/Tay-To.mp3",
            image: "./assets/img/mck2.jpg",
        },
        {
            name: "XTC-Xich",
            singer: "MCK / Tlinh",
            path: "./assets/music/XTC-Xich.mp3",
            image: "./assets/img/mck3.jpg",
        },
        {
            name: "Lời đường mật",
            singer: "Hiếu thứ hai",
            path: "./assets/music/Loi-Duong-Mat-LyLy-HIEUTHUHAI.mp3",
            image: "./assets/img/hieuthuhai.jpg",
        },
        {
            name: "Phải là yêu",
            singer: "Hiếu thứ hai",
            path: "./assets/music/Phai-La-Yeu.mp3",
            image: "./assets/img/hieuthuhai2.jpg",
        },
        {
            name: "1-800",
            singer: "Hiếu thứ hai",
            path: "./assets/music/1-800.mp3",
            image: "./assets/img/hieuthuhai3.jpg",
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${
                index === this.currentIndex ? "active" : ""
            }" data-index="${index}">
                <div class="thumb">
                    <div class="thumb" style="background-image: url('${
                        song.image
                    }')">
                    </div>
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <div class="fas fa-ellipsis-h"></div>
                </div>
            </div>
            `;
        });
        playlist.innerHTML = htmls.join("");
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },
    handleEvents: function () {
        const _this = this;
        const cdWith = cd.offsetWidth;

        //Xử lý CD quay và dừng
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 10000, // 10 seconds
                iterations: Infinity,
            }
        );
        cdThumbAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = document.documentElement.scrollTop;
            const newCdWidth = cdWith - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWith;
        };

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };
        // Khi song được pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };

        // Xử lý khi tua song
        progress.oninput = function (e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        };

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // khi  bật / tắt random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        // Xử lý lặp 1 bài hát
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat; // đảo lại
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");
            if (songNode || !e.target.closest(".option")) {
                // Xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                // xử lý khi click vào song option
                if (e.target.closest(".option")) {
                    // ....
                }
            }
        };
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 300);
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        // đọc từ localstorage --> lưu vào config --> load config
        // --> lưu vào cấu hình gốc
        this.loadConfig();

        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe xử lý các sự kiện (DOM events)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};

app.start();
