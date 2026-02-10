from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')
start = text.index('    <div id= skills class=container hidden>')
end = text.index('    <div id=contact', start)
new_block = '''    <div id=skills class=container hidden>
        <div class=content>
            <div class=header>
                <h1 class=name>skills</h1>
                <p class=tagline>Development and creative tools</p>
            </div>

            <div class=discord-card>
                <div class=skills-section-title>
                    <i class=fas fa-code></i>
                    <span>Development</span>
                </div>

                <div class=languages-grid>
                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg alt=HTML>
                        </div>
                        <div class=language-name>HTML</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg alt=CSS>
                        </div>
                        <div class=language-name>CSS</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg alt=JS>
                        </div>
                        <div class=language-name>JS</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg alt=JavaScript>
                        </div>
                        <div class=language-name>JavaScript</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg alt=Python>
                        </div>
                        <div class=language-name>Python</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.jsdelivr.net/gh/devicons/devicon/icons/lua/lua-original.svg alt=Lua>
                        </div>
                        <div class=language-name>Lua</div>
                    </div>
                </div>
            </div>

            <div class=discord-card>
                <div class=skills-section-title>
                    <i class=fas fa-laptop-code></i>
                    <span>Development Tools</span>
                </div>

                <div class=languages-grid>
                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg alt=VSCode>
                        </div>
                        <div class=language-name>VSCode</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.simpleicons.org/github/ffffff alt=GitHub>
                        </div>
                        <div class=language-name>GitHub</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg alt=MySQL>
                        </div>
                        <div class=language-name>MySQL</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.simpleicons.org/modrinth/ffffff alt=Modrinth>
                        </div>
                        <div class=language-name>Modrinth</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.simpleicons.org/roblox/ffffff alt=Roblox Studio>
                        </div>
                        <div class=language-name>Roblox Studio</div>
                    </div>
                </div>
            </div>

            <div class=discord-card>
                <div class=skills-section-title>
                    <i class=fas fa-palette></i>
                    <span>Creative Tools</span>
                </div>

                <div class=languages-grid>
                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.simpleicons.org/affinitydesigner/ffffff alt=Affinity>
                        </div>
                        <div class=language-name>Affinity</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.simpleicons.org/davinciresolve/ffffff alt=DaVinci Resolve>
                        </div>
                        <div class=language-name>DaVinci Resolve</div>
                    </div>

                    <div class=language-card>
                        <div class=language-icon>
                            <img src=https://cdn.simpleicons.org/blender/ffffff alt=Blender>
                        </div>
                        <div class=language-name>Blender</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
'''
path.write_text(text[:start] + new_block + text[end:], encoding='utf-8')
