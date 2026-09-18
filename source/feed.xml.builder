xml.instruct!
xml.feed "xmlns" => "http://www.w3.org/2005/Atom" do
  site_url = "http://www.rstuder.ch/"
  posts = blog(:blog).articles
  pieces = blog(:tracks).articles
  entries = (posts + pieces).sort_by(&:date).reverse

  xml.title "Roli"
  xml.subtitle "UX guy gone dev, lover of Stimulus Reflex"
  xml.id URI.join(site_url, blog(:blog).options.prefix.to_s)
  xml.link "href" => URI.join(site_url, blog(:blog).options.prefix.to_s)
  xml.link "href" => URI.join(site_url, current_page.path), "rel" => "self"
  xml.updated(entries.first.date.to_time.iso8601) unless entries.empty?
  xml.author { xml.name "Roland Studer" }

  entries[0..5].each do |article|
    audio = article.data.audio
    audio = URI.join(site_url, article.url, audio).to_s if audio   # piece mp3s are relative to their folder
    xml.entry do
      xml.title article.title
      xml.link "rel" => "alternate", "href" => URI.join(site_url, article.url)
      xml.link "rel" => "enclosure", "type" => "audio/mpeg", "href" => audio if audio
      xml.id URI.join(site_url, article.url)
      xml.published article.date.to_time.iso8601
      xml.updated File.mtime(article.source_file).iso8601
      xml.author { xml.name "Roland Studer" }
      body = article.body
      # Feed readers often drop <audio>, so give them a plain link too.
      body = %(<p><audio controls src="#{audio}"></audio><br><a href="#{audio}">Listen to the MP3</a></p>) + body if audio
      # Pieces with a full-page player deserve a nudge to leave the reader.
      if article.data.page
        page_url = URI.join(site_url, article.url)
        body = %(<p><em>This post is a music track with its own dedicated player page. Check it out at <a href="#{page_url}">#{page_url}</a>.</em></p>) + body
      end
      xml.content body, "type" => "html"
    end
  end
end
