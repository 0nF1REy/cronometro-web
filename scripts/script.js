document.addEventListener('DOMContentLoaded', function () {
    const timerDisplay = document.querySelector('.timerDisplay');
    const startPauseButton = document.getElementById('startPauseTimer');
    const resetButton = document.getElementById('resetTimer');
    const movingStar = document.querySelector('.cron-movi');
    const container = document.querySelector('.container');
    let starWrapper
    let [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0];
    let currentInterval;
    let isRunning = false;
    let lastMinute = -1;
    let animationInProgress = false;
    let animationTimeCounter = 0;
    let startTime = 0;

    function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }

    async function changeStarColor() {
        try {
            const response = await fetch(movingStar.src);
            if (!response.ok) {
                console.error(`changeStarColor: Erro ao carregar SVG. Status: ${response.status} ${response.statusText}`);
                return;
            }
            const svgData = await response.text();
            starWrapper.innerHTML = svgData;
            const svgElement = starWrapper.querySelector('svg');
            if (svgElement) {
                svgElement.setAttribute('fill', getRandomColor());
            } else {
                console.error("changeStarColor: Elemento 'svg' não encontrado dentro do SVG.");
            }
        } catch (error) {
            console.error("changeStarColor: Erro ao carregar ou manipular SVG:", error);
        }
    }

    async function resetStarColor() {
        try {
            const response = await fetch(movingStar.src);
            if (!response.ok) {
                console.error(`resetStarColor: Erro ao carregar SVG. Status: ${response.status} ${response.statusText}`);
                return;
            }
            const svgData = await response.text();
            starWrapper.innerHTML = svgData;
            const svgElement = starWrapper.querySelector('svg');
            if (svgElement) {
                svgElement.setAttribute('fill', 'white');
            } else {
                console.error("resetStarColor: Elemento 'svg' não encontrado dentro do SVG.");
            }
        } catch (error) {
            console.error("resetStarColor: Erro ao carregar ou manipular SVG:", error);
        }
    }


    function applyWaveEffect() {
        if (!animationInProgress) {
            animationInProgress = true;
            let step = 0;
            const startTimeAnim = performance.now();

            const animate = (currentTime) => {
                const elapsedTime = currentTime - startTimeAnim;
                const duration = 4000;

                if (elapsedTime < duration) {
                    const progress = elapsedTime / duration;
                    if (progress < 0.25) {
                        step = 0;
                    } else if (progress < 0.50) {
                        step = 1;
                    } else if (progress < 0.75) {
                        step = 2;
                    } else if (progress < 1) {
                        step = 3;
                    } else {
                        step = 4
                    }

                    let transformValue;
                    let filterValue;

                    if (step === 0) {
                        transformValue = `translateY(0) rotate(0deg) scale(1)`;
                        filterValue = `drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2))`;
                    } else if (step === 1) {
                        transformValue = `translateY(-5px) rotate(-3deg) scale(1.05)`;
                        filterValue = `drop-shadow(0 67px 4px rgba(0, 0, 0, 0.3))`;
                    } else if (step === 2) {
                        transformValue = `translateY(10px) rotate(2deg) scale(1.03)`;
                        filterValue = `drop-shadow(0 67px 10px rgba(0, 0, 0, 0.25))`;
                    } else if (step === 3) {
                        transformValue = `translateY(-4px) rotate(-1deg) scale(1.04)`;
                        filterValue = `drop-shadow(0 67px 4px rgba(0, 0, 0, 0.28))`;
                    } else {
                        transformValue = `translateY(0) rotate(0deg) scale(1)`;
                        filterValue = `drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2))`;
                    }
                    timerDisplay.style.transform = transformValue;
                    timerDisplay.style.filter = filterValue;
                    requestAnimationFrame(animate);
                } else {
                    timerDisplay.style.transform = `translateY(0) rotate(0deg) scale(1)`;
                    timerDisplay.style.filter = `drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))`;
                    animationInProgress = false;
                }
            };
            requestAnimationFrame(animate);
        }
    }


    function displayTimer() {
        if (isRunning) {
            milliseconds += 10;
            animationTimeCounter += 10;
        }
        if (milliseconds === 1000) {
            milliseconds = 0;
            seconds++;
            if (seconds === 60) {
                seconds = 0;
                minutes++;
                if (minutes === 60) {
                    minutes = 0;
                    hours++;
                }
                if (isRunning && (minutes !== lastMinute || lastMinute === -1)) {
                    changeStarColor();
                    lastMinute = minutes;
                }
            }
        }
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        const ms = String(milliseconds).padStart(3, '0');
        timerDisplay.textContent = `${h} : ${m} : ${s} : ${ms}`;

        if (isRunning && animationTimeCounter >= 60000) {
            applyWaveEffect();
            animationTimeCounter = 0;
        }
    }


    startPauseButton.addEventListener('click', () => {
        playAudio();
        if (!isRunning) {
            currentInterval = setInterval(displayTimer, 10);
            startPauseButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
            resetButton.classList.add('visible-button');
            if (startTime === 0) {
                startTime = performance.now();
            }
        } else {
            clearInterval(currentInterval);
            startPauseButton.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
        isRunning = !isRunning;
    });

    resetButton.addEventListener('click', () => {
        playAudio();
        clearInterval(currentInterval);
        [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0];
        timerDisplay.textContent = '00 : 00 : 00 : 000';
        isRunning = false;
        animationInProgress = false;
        lastMinute = -1;
        startTime = 0;
        animationTimeCounter = 0;
        startPauseButton.innerHTML = '<i class="fa-solid fa-play"></i>';
        resetButton.classList.remove('visible-button');
        resetStarColor();
    });

    const audio = new Audio("./assets/audio/click-sound.mp3");
    function playAudio() {
        audio.currentTime = 0;
        audio.play();
    }

    const buttons = document.querySelectorAll(".buttons button");

    buttons.forEach((button) => {
        button.addEventListener("click", playAudio);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            startPauseButton.click();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'r' || event.key === 'R') {
            resetButton.click();
        }
    });

    starWrapper = document.querySelector('.cron-wrapper');
    const fetchSvg = async () => {
        try {
            const response = await fetch(movingStar.src);
            if (!response.ok) {
                console.error(`Inicialização: Erro ao carregar SVG. Status: ${response.status} ${response.statusText}`);
                return;
            }
            const svgData = await response.text();
            starWrapper.innerHTML = svgData;
            const svgElement = starWrapper.querySelector('svg');
            if (svgElement) {
                svgElement.setAttribute('fill', 'white');
            }
            else {
                console.error("Inicialização: Elemento 'svg' não encontrado dentro do SVG.");
            }
        } catch (error) {
            console.error("Inicialização: Erro ao carregar ou manipular SVG no carregamento inicial:", error);
        }
    }
    document.addEventListener('DOMContentLoaded', fetchSvg);

    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
    console.log(`
                             @@@@@@@@                              
                             @@@@@@@@                              
                             @@@@@@@@                              
                             @@@@@@@@                              
                               @@@@          @                     
                               @@@@         @@@                    
                           @@@@@@@@@@@     @@@@@                   
                         @@@@@@@@@@@@@@@@  @@@@@@                  
                        @@@@@@@@@@@@@@@@@@@@@@@@@                  
                      @@@@@@@@@@@@@@@@@@@@@@@@@@@                  
                      @@@@@@@@      @@@@@@@@@@@@                   
                     @@@@@@           @@@@@@@@                     
                    @@@@@@      @@      @@@@@@                     
                   @@@@@@       @@       @@@@@                     
                   @@@@@   @    @@   @@   @@@@@                    
                  @@@@@   @@@       @@@@  @@@@@                    
                  @@@@@   @@       @@@@    @@@@@                   
                  @@@@            @@@@     @@@@@                   
                  @@@@          @@@@@@      @@@@                   
                  @@@@        @@@@@@@       @@@@                   
                 @@@@@  @@@   @@@@@@   @@@  @@@@                   
                 @@@@@  @@@   @@@@@    @@@  @@@@                   
                  @@@@         @@@@         @@@@                   
                  @@@@          @@          @@@@                   
                  @@@@                     @@@@@                   
                  @@@@@   @@@        @@    @@@@@                   
                  @@@@@   @@@        @@   @@@@@                    
                   @@@@@   @    @@   @@   @@@@@                    
                   @@@@@@       @@       @@@@@                     
                    @@@@@@      @@      @@@@@@                     
                     @@@@@@           @@@@@@@                      
                     @@@@@@@@       @@@@@@@@                       
                      @@@@@@@@@@@@@@@@@@@@@                        
                        @@@@@@@@@@@@@@@@@@                         
                         @@@@@@@@@@@@@@@                           
                            @@@@@@@@@@                             
 `);
});