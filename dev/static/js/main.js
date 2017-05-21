
// Начинать писать отсюда!!!!
$(document).ready(function(){
    $('.header').slick({
        dots: true,
        speed: 300,
        slidesToShow: 2,
        slidesToScroll: 1,
        responsive: [
    {
        breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: true
            }
        }
  ]

    });
});
