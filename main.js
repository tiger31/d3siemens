let data = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")) : [];

const elem = document.getElementById("container");

let width = 0;
let height = 0;
const padding = 30;

//SVG контейнер
const svg = d3.select("#svg").append("svg");

//Оси графика
x = d3.scaleTime();
y = d3.scaleLinear();

line = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.value));

//Линия графика
svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round");

updateChartData();

//Перестраиваем график если меняются размеры окна
window.addEventListener("resize", function () {
    resize();
});

//Добавление элемента
document.getElementById("add").addEventListener("click", function () {
    const field = document.getElementById("new-value");
    const value = +field.value;
    if (!Number.isNaN(value)) {
        addElem(value);
    }
    field.value = null;
});

Array.prototype.forEach.call(document.getElementsByClassName("arrow"), arrow => {
    arrow.addEventListener("click", function () {
        const _class = (arrow.classList.contains("left") ? "right" : "left");
        arrow.classList.remove("left", "right");
        arrow.classList.add(_class);
        if (arrow.parentNode.classList.contains("hidden"))
            arrow.parentNode.classList.remove("hidden");
        else
            arrow.parentNode.classList.add("hidden");
        //Так как отслеживать событие resize можно только на window - анимация будет на стороне css
        //Имитируем постоянное изменение размеров с помощью интервала
        //10ms вполне хватает для плавной анимации
        let animation = setInterval(resize, 10);
        setTimeout(function () { clearInterval(animation) }, 500);
    });

});

//Можно было бы использовать moment.js, ну да ладно
function date(time) {
    time = new Date(time);
    return `${time.getDate() > 9 ? "" : "0"}${time.getDate()}.${time.getMonth() > 9 ? "" : "0"}${time.getMonth()}.${time.getFullYear()}${time.getHours() > 9 ? "" : "0"} ${time.getHours()}:${time.getMinutes() > 9 ? "" : "0"}${time.getMinutes()}:${time.getSeconds() > 9 ? "" : "0"}${time.getSeconds()}`;
}

//Изменение размеров графика
function resize() {
    //controls.width + divs.margin + border = 292
    width = elem.offsetWidth - 292;
    height = elem.offsetHeight - 5;

    //Границы осей
    x.range([0, width]);
    y.range([height - padding, padding]);

    //Заменяем размеры и атрибут line на новые
    svg.attr("width", width)
        .attr("height", height)
        .select("path")
        .attr("d", line);
    //Замеяем положение подписей
    svg.selectAll("text")
        .attr("x", line.x())
        .attr("y", line.y());
}

//Изменение выборки и ее границ на графике
function updateChartData() {
    localStorage.setItem("data", JSON.stringify(data));
    //Пересчет осей
    x.domain(d3.extent(data, d => d.time));
    y.domain(d3.extent(data, d => d.value));

    //Замена выборки для графика
    svg.select("path").datum(data);

    //Замена выборки для подписей
    const text = svg.selectAll("text")
        .data(data);

    //Добавляем сам svg-тэг text для новых элементов
    //Для всех, включая те элементы, что были - обновляем данные и положение
    text.enter()
        .append("text")
        .merge(text)
        .text(d => d.value);
    //Удаляем неиспользуемые элемены
    text.exit()
        .remove();

    /* Список уже введенных элементов */
    const labels = d3.select("#values").selectAll(".value-container")
        .data(data);

    //Создаем div для нового элемента, если он есть
    labels.enter()
        .append("div")
        .attr("class", "value-container")
        .html('<span class="time"></span><span class="value"></span><button class="removeValue">Remove</button>');

    //Удаление лишнего
    labels.exit()
        .remove();

    //Записываем время, значение и вешаем событие на удаление ко клику на кнопку
    d3.selectAll(".time")
        .data(data)
        .text(d => date(d.time));
    d3.selectAll(".value")
        .data(data)
        .text(d => d.value);
    d3.selectAll(".removeValue")
        .data(data)
        .on("click", (d, i) => removeElem(i));

    resize();
}

//Добавление нового элемента
function addElem(value) {
    data.push({
        value : value,
        time : + new Date()
    });
    updateChartData();
}

//Удаление элемента по индексу
function removeElem(index) {
    data.splice(index, 1);
    updateChartData();
}

