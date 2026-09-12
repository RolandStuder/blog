# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

activate :directory_indexes

activate :livereload
# activate :vegas
activate :syntax

set :markdown_engine, :redcarpet
set :markdown, :fenced_code_blocks => true, :smartypants => true

# Layouts
# https://middlemanapp.com/basics/layouts/

# Per-page layout changes
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

Time.zone = "Bern"

# Ignore jam session venue files to prevent automatic page creation
ignore 'sevilla-jam-sessions/*'


# With alternative layout
# page '/path/to/file.html', layout: 'other_layout'

# Proxy pages
# https://middlemanapp.com/advanced/dynamic-pages/
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# Activate and configure blog extension

activate :blog do |blog|
  blog.name = "blog"
  # This will add a prefix to all links, template references and source paths

  # blog.permalink = "{year}/{month}/{day}/{title}.html"
  # Matcher for blog source files
  blog.sources = "posts/{title}.html"
  # blog.taglink = "tags/{tag}.html"
  # blog.layout = "layout"
  # blog.summary_separator = /(READMORE)/
  # blog.summary_length = 250
  # blog.year_link = "{year}.html"
  # blog.month_link = "{year}/{month}.html"
  # blog.day_link = "{year}/{month}/{day}.html"
  # blog.default_extension = ".markdown"
  blog.permalink = "{title}.html"
  # blog.tag_template = "tag.html"
  # blog.calendar_template = "calendar.html"

  # Enable pagination
  # blog.page_link = "page/{num}"
end

# Tracks: a second collection of composed pieces.
# Each piece is a folder source/tracks/<slug>/ holding index.html.md, its mp3 and,
# when `page: true`, its own _page.erb / page.css / page.js for a full-page experience.
activate :blog do |blog|
  blog.name = "tracks"
  blog.prefix = "tracks"
  blog.sources = "{title}/index.html"
  blog.permalink = "{title}/index.html"
  blog.layout = "tracks"
end

page "/feed.xml", layout: false
# Reload the browser automatically whenever files change
# configure :development do
#   activate :livereload
# end

# Helpers
# Methods defined in the helpers block are available in templates
# https://middlemanapp.com/basics/helper-methods/

helpers do
  # A blog post may ship its own stylesheet next to it:
  #   source/posts/my-post.html.md
  #   source/posts/my-post.css
  # Returns the stylesheet resource if one exists, nil otherwise.
  def article_stylesheet(article = current_article)
    return nil if article.nil?
    base = File.basename(article.source_file).sub(/\..*\z/, '')
    sitemap.find_resource_by_path("/posts/#{base}.css")
  end
end

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings

configure :build do
  # Minify CSS on build
  # activate :minify_css

  # Minify Javascript on build
  # activate :minify_javascript
end
