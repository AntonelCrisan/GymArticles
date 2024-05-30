$(document).ready(function(){
    $('#search-input').on('input', function() {
        const query = $(this).val();
        if(query.length > 2) { // Search after 3 characters
            $.ajax({
                url: '/search-suggestions',
                method: 'GET',
                data: { q: query },
                success: function(data) {
                    let suggestions = $('#suggestions');
                    suggestions.empty();
                    if(data.length > 0) {
                        suggestions.show();
                        data.forEach(item => {
                            suggestions.append('<li>' + item + '</li>');
                        });
                    } else {
                        suggestions.hide();
                    }
                }
            });
        } else {
            $('#suggestions').hide();
        }
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('#search-input, #suggestions').length) {
            $('#suggestions').hide();
        }
    });
});