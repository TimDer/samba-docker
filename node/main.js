const readIniFile   = require("read-ini-file")
const fs            = require("fs")
const { exec }      = require("child_process")

const iniFile = process.env.userFile

if (fs.existsSync(iniFile)) {
    // add users
    const json = readIniFile.sync(iniFile)
    
    if (json !== undefined) {
        for (const [key, value] of Object.entries(json)) {
            // create command to execute
            let command = ``

            // create user
            command = `${command}useradd ${key}`

            // edit smb.conf
            command = `${command} && echo "\\n\\n[${value.shareName}]
    comment = data
    path = ${value.dir}
    force group = ${key}
    force user = ${key}
    writeable = yes
    read only = No" >> /etc/samba/smb.conf`

            // add smb password
            command = `${command} && printf "${value.password}\\n${value.password}\\n" | smbpasswd -a -s "${key}"`

            // check if the dir exists
            if (!fs.existsSync(value.dir)) {
                command = `${command} && mkdir ${value.dir}`
            }

            // chown to name:group
            command = `${command} && chown ${key}:${key} ${value.dir}`
            
            exec(command)
        }
    }
}