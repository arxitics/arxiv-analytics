/*!
 * Parser snippets
 */

(function ($) {
  'use strict';

  var notebook = {};
  if (localStorage.notebook) {
    notebook = JSON.parse(localStorage.notebook);
  } else {
    var today = new Date().toISOString();
    notebook = {
      created: today,
      updated: today,
      sheets: []
    };
  }

  // Initialize notebook
  notebook.load = function (start, end) {
    var contents = [];
    notebook.sheets.slice(start || 0, end).forEach(function (sheet, index) {
      contents.push(notebook.parse(sheet, index + 1));
    });
    $('#math-notebook').html(contents.join('')).scrollTop($('#math-notebook').height());
    if (window.MathJax) {
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'math-notebook']);
    }
  };

  // Parse sheet
  notebook.parse = function (sheet, index) {
    var data = {
      id: index,
      expr: sheet.expr,
      tex: String(sheet.tex).replace(/^[\$]{2}(.*)[\$]{2}$/, '\\(\\displaystyle $1\\)')
    };
    if (sheet.result) {
      data.state = 'success';
      data.report = JSON.stringify(sheet.result, null, 1);
    } else if (sheet.error) {
      data.state = 'danger';
      data.report = sheet.error;
    }
    return schema.format('<li id="sheet-${id}"><div><code>(i${id})</code> ${expr}</div><div><p class="ui-offset-small ui-text-indent">${tex}</p><code>(o${id})</code> <span class="ui-color-${state}">${report}</span></div></li>', data);
  };

  // Save notebook data
  notebook.save = function (sheet) {
    this.updated = new Date().toISOString();
    this.sheets.push(sheet);
    localStorage.notebook = JSON.stringify(this);
  };

  // Export notebook data
  notebook.export = function () {
    var json = JSON.stringify(this, null, 2);
    window.open('data:application/json;charset=utf-8,' + encodeURIComponent(json));
  };

  // Display worksheet
  notebook.display = function (sheet) {
    var index = $('#math-notebook > li').size() + 1;
    $('#math-notebook').append(notebook.parse(sheet, index)).scrollTop($('#math-notebook').height());
    if (window.MathJax) {
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'sheet-' + index]);
    }
  };

  notebook.init = function() {
    notebook.load();
    $('#parser-form').on('submit', function() {
      var $_this = $(this);
      var $_textarea = $_this.find('textarea');
      var expr = $_textarea.val().trim();
      if (expr !== '') {
        $.post($_this.attr('action'), $_this.serialize(), function (data) {
          notebook.display(data);
          notebook.save(data);
        });
        $_textarea.val('');
      }
      return false;
    });
  };

  $(document).ready(function () {
    notebook.init();

    $('#notebook-view').on('click', function () {
      notebook.load();
    });
    $('#notebook-clear').on('click', function () {
      $('#math-notebook').empty();
    });
    $('#notebook-export').on('click', function () {
      notebook.export();
    });
    $('#notebook-delete').on('click', function () {
      localStorage.clear('notebook');
      $('#math-notebook').empty();
    });
  });

})(jQuery);
