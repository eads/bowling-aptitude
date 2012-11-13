$.fn.spin = function(opts) {
  this.each(function() {
    var $this = $(this),
        data = $this.data();

    if (data.spinner) {
      data.spinner.stop();
      delete data.spinner;
    }
    if (opts !== false) {
      data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
    }
  });
  return this;
};
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// --- Models ---

// A bowler
var BowlerImage = Backbone.Model.extend({});

// --- Views ---

// A photo upload widget
var PhotoUploadView = Backbone.View.extend({
    initialize: function() {
        this.$target = $(this.$el.data('target'));
    },
    events: {
        'change': 'change'
    },
    change: function (e) {
        var file = this.el.files[0],
            reader = new FileReader(),
            upload = this;

        reader.onerror = function (event) {
            upload.$target.html("Error reading file");
        }
        reader.onload = function (event) {
            var img = new Image();

            // files from the Gallery need the URL adjusted
            if (event.target.result && event.target.result.match(/^data:base64/)) {
                img.src = event.target.result.replace(/^data:base64/, 'data:image/jpeg;base64');
            } else {
                img.src = event.target.result;
            }
            img.width = 250;
            upload.model.set({'img': img});
        };
        reader.readAsDataURL(file);
        return false;
    }
});

// A bowler image
var BowlerView = Backbone.View.extend({
    initialize: function() {
        this.model.on('change', this.render, this);
    },
    render: function() {
        this.$el.html('');
        var rendered = $('<div class="bowler-image">')
            .append($('<div class="bowler-scanner">'))
            .append(this.model.get('img'));
        this.$el.append(rendered);
        $('#analysis').fadeOut();
    }
});

var AnalyzeButton = Backbone.View.extend({
    outcome_messages: [
        ['rejected', 'UNFIT TO BOWL'],
        ['accepted', 'POSSIBLY FIT TO BOWL'],
    ],
    categories: ['Strength', 'Spin', 'Velocity', 'Style'],
    choices: [
        ['10%', '23%', '44%', '60%', '67%', '28%', '35%', '46%', '77%', '95%'],
        ['Wobbly', 'Beguiling', 'Slightly absurd', 'Very curious', 'Awe-inspiring'],
        ['1','2','3','4','5','6','7','8','9','10', '13'],
        ['Injury-threatening', 'Barely competent', 'Under control']
    ],
    initialize: function(options) {
        this.template = options.template;
        this.$target = $(this.$el.data('target')).hide();
        var button = this;
    },
    events: {
        'click': 'click'
    },
    click: function() {
        this.$target.html('');
        $('.bowler-scanner').css({'top': '-258px'});
        var button = this;
        $('.bowler-scanner').animate({'top': '-8px'}, 2000, function() {
            $('.bowler-scanner').animate({'top': '-258px'}, 2000, function() {
                button.render();
            });
        });
    },
    render: function() {
        var action = this.$el.data('action'),
            choices = _.shuffle(_.map(this.choices, _.shuffle)),
            stats = _.zip(this.categories, choices),
            kitten_size = getRandomInt(200,400),
            context = { 
                message: '',
                stats: stats,
                spirit_animal: 'http://placekitten.com/' + kitten_size + '/' + kitten_size
            };

        if (action == 'reject') {
            context.msg_class = this.outcome_messages[0][0];
            context.message = this.outcome_messages[0][1];
        } else if (action == 'accept') {
            context.msg_class = this.outcome_messages[1][0];
            context.message = this.outcome_messages[1][1];
        } else {
            var random = _.shuffle(this.outcome_messages).pop();
            context.msg_class = random[0];
            context.message = random[1];
        }

        this.$target.append(this.template(context)).fadeIn();
    }
});
