/* 
    1. Render songs
    2.Scroll top
    3. Play / pause / seek
    4. CD rotate
    5. Next / prev
    6. Random 
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
*/
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'DUONG_PLAYER'

const player = $('.player')
const heading = $('header marquee')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const volumeIcon = $('.volume .btn-volume')
const volumeSet = $('#volumeAdjust')
const startTime = $('startTime')
const endTime = $('endTime')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isMute: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Hoang Mang remix',
            singer: 'Hồ Quỳnh Hương',
            path: './assets/Song1.mp3',
            image: './assets/Logo.png',
        },
        {
            name: 'Ngày đẹp trời để nói chia tay',
            singer: 'Lou Hoàng',
            path: './assets/Song2.mp3',
            image: './assets/Image2.jpg',
        },
        {
            name: 'Lặng yên',
            singer: 'Bùi Anh Tuấn, Ái Phương',
            path: './assets/Song3.mp3',
            image: './assets/Image3.jpg',
        },
        {
            name: 'Tránh duyên remix',
            singer: 'Đình Dũng',
            path: './assets/Song4.mp3',
            image: './assets/Image4.jpg',
        },
        {
            name: 'Thần thoại',
            singer: 'Jackie Chan',
            path: './assets/Song5.mp3',
            image: './assets/Image5.jpg',
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        this.setConfig('currentIndex', this.currentIndex);
        const htmls = this.songs.map((song, index) => {
            return `
                                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                                    <div class="thumb" style="background-image:url('${song.image}')">
                                    </div>
                                    <div class="body">
                                        <h3 class="title">${song.name}</h3>
                                        <p class="author">${song.singer}</p>
                                    </div>
                                    <div class="option">
                                        <i class="fas fa-ellipsis-h"></i>
                                    </div>
                                </div>
                            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        //this.setConfig('currentIndex', this.currentIndex);
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }

        })
    },

    handleEvent: function () {
        const cdWidth = cd.offsetWidth
        const _this = this

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity, //
        })
        cdThumbAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }

            
            // Khi song được play
            audio.onplay = function () {
                cdThumbAnimate.play();
                _this.isPlaying = true
                player.classList.add('playing')
            }

            // Khi song được pause
            audio.onpause = function () {
                cdThumbAnimate.pause();
                _this.isPlaying = false
                player.classList.remove('playing')
            }

            // Khi tiến độ bài hát thay đổi
            audio.ontimeupdate = function () {
                if (audio.duration) {
                    const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                    progress.value = progressPercent
                }
            }
        }

        // Xử lý khi tua song
        progress.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRepeat) {
                _this.loadCurrentSong()
            }
            else {
                if (_this.isRandom) {
                    _this.playRandomSong()
                } else {
                    _this.nextSong()
                }

            }
            audio.play()
            _this.render();
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRepeat) {
                _this.loadCurrentSong()
            }
            else {
                if (_this.isRandom) {
                    _this.playRandomSong()
                } else {
                    _this.prevSong()
                }
            }
            audio.play()
            _this.render();
            _this.scrollToActiveSong()

        }

        // Xử lý bật / tắt random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý bật / tắt repeat song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý next song khi audio ended
        audio.onended = function () {
            nextBtn.click();
        }
        // Lắng nghe hành vi click vào playlist 
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option')
            // Xử lý khi click vào song
            if (songNode || optionNode) {

                if (songNode) {

                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render();
                    cdThumbAnimate.play();
                    _this.isPlaying = true
                    player.classList.add('playing')
                    audio.play()
                }
                if (optionNode) {

                }
            }
        }


        function volumeDisplay() {
            volumeSet.value = _this.songVolume;
            var volumeColor = 'linear-gradient(90deg, rgb(75, 36, 173)' + _this.songVolume + '%, rgb(214, 214, 214) ' + _this.songVolume + '%)';
            volumeSet.style.background = volumeColor;
        };
        //Volume adjustment
        volumeSet.oninput = function (e) {
            _this.songVolume = e.target.value;
            audio.volume = _this.songVolume / 100;
            volumeDisplay();
            _this.setConfig("volume", _this.songVolume);
            _this.volumeIconHandle();
        };
        
        volumeIcon.onclick = function () {
            _this.isMute = !_this.isMute;
            _this.setConfig('isMute', _this.isMute);
            if (_this.isMute) {
                audio.muted = true;
                volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>'
            }
            else {
                audio.muted = false;
                _this.volumeIconHandle();
            }
        }

    },
    scrollToActiveSong: function () {
        var view = '';
        if (this.currentIndex < 2) view = 'end';
        else view = 'nearest';
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: view,
            });
        }, 300)
    },
    volumeIconHandle: function () {
        const volume = this.songVolume;
        if(!this.isMute) {
            if (volume > 50) volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>'
            else {
                if (volume >= 5 && volume <= 50) volumeIcon.innerHTML = '<i class="fas fa-volume-down"></i>'
                else volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>'
            }
        }

    },
    volumeLoad: function () {
        ///Volume 
        this.songVolume = this.config.volume;
        volumeSet.value = this.songVolume;
        var volumeColor = 'linear-gradient(90deg, rgb(75, 36, 173)' + this.songVolume + '%, rgb(214, 214, 214) ' + this.songVolume + '%)';
        volumeSet.style.background = volumeColor;
        //Icon
        this.volumeIconHandle();

    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name + ' - ' + this.currentSong.singer
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        this.isMute = this.config.isMute
        this.songVolume = this.config.songVolume
        this.currentIndex = this.config.currentIndex
        // Cách 2:
        // Object.assign(this, this.config)
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        this.volumeLoad()

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()
        console.log(this.currentIndex);
        // Lắng nghe / xử lý các xự kiện (DOM events)
        this.handleEvent()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của Random & Repeat
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },
}
app.start()
