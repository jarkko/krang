require 'rake'
require 'fileutils'

KRANG_ROOT     = File.expand_path(File.dirname(__FILE__))
KRANG_SRC_DIR  = File.join(KRANG_ROOT, 'src')
KRANG_DIST_DIR = File.join(KRANG_ROOT, 'dist')
KRANG_DOC_DIR  = File.join(KRANG_ROOT, 'doc')

$:.unshift File.join(KRANG_ROOT, 'vendor', 'sprockets', 'lib')
def sprocketize(path, source, destination = source)
  begin
    require 'sprockets'
  rescue Exception
    puts "\nYou'll need Sprockets to build Krang. Just run:\n\n"
    puts "  $ git submodule init"
    puts "  $ git submodule update"
    puts "\nand you should be all set.\n\n"
    return
  end
  
  root      = File.join(KRANG_ROOT,    path  )
  load_path = File.join(KRANG_SRC_DIR, source)
  
  secretary = Sprockets::Secretary.new(
    :root => root,
    :load_path => [load_path],
    :source_files => [source]
  )
  
  secretary.concatenation.save_to(File.join(KRANG_DIST_DIR, destination))
end

def compress(in_filename, out_filename)
  begin
    require 'yui/compressor'
  rescue Exception
    puts "\nYou'll need the YUI Compressor gem to generate a compressed version\n"
    puts "of Krang. Just run:\n\n"
    puts "  $ gem install -r yui-compressor"
    puts "\nand you should be all set.\n\n"
    return
  end
  compressor = YUI::JavaScriptCompressor.new
  
  in_file  = File.join(KRANG_DIST_DIR, in_filename)
  out_file = File.join(KRANG_DIST_DIR, out_filename)
  
  compressed_source = compressor.compress(File.readlines(in_file))  
  File.open(out_file, "w") { |f| f.write(compressed_source) }
end


desc "Generates the distributable krang.js file."
task :dist do
  FileUtils.mkdir_p(KRANG_DIST_DIR) unless File.exists?(KRANG_DIST_DIR)
  sprocketize('src', 'krang.js')
end

desc "Generates a compressed (with YUI Compressor) version of the distributable."
task :compress => :dist do
  compress('krang.js', 'krang.compressed.js')
end