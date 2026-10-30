name 'ai-cityhall'
author 'TGIANN'
version '0.1.0'
license 'GPL-3.0-only'
description 'City hall: job center and documents'
repository 'https://github.com/TGIANN/ai-cityhall'
fx_version 'cerulean'
game 'gta5'
node_version '22'

client_script 'dist/client.js'
server_script 'dist/server.js'


dependencies {
	'/onesync',
	'ai-core',
}

files {
	'locales/*.json',
	'data/halls.json',
	'data/settings.json',
}
