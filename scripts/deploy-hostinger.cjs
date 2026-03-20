require('dotenv').config();
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: process.env.FTP_PORT || 21,
    localRoot: __dirname + '/../dist',
    remoteRoot: process.env.FTP_REMOTE_ROOT || '/public_html',
    include: ['*', '**/*'],
    exclude: [],
    deleteRemote: false,
    forcePasv: true,
    sftp: false,
    timeout: 300000, // 5 minutes
};

console.log('🚀 Starting deployment to Hostinger...\n');
console.log(`📁 Uploading from: ${config.localRoot}`);
console.log(`🌐 Uploading to: ${config.host}${config.remoteRoot}\n`);

ftpDeploy
    .deploy(config)
    .then(res => {
        console.log('\n✅ Deployment successful!');
        console.log(`📊 Files uploaded: ${res.length}`);
        console.log('\n🌐 Your site should be updated at: https://soulthread.in');
    })
    .catch(err => {
        console.error('\n❌ Deployment failed:');
        console.error(err);
        process.exit(1);
    });

ftpDeploy.on('uploading', function (data) {
    const percent = Math.round((data.transferredFileCount / data.totalFilesCount) * 100);
    process.stdout.write(`\r📤 Uploading: ${data.transferredFileCount}/${data.totalFilesCount} (${percent}%) - ${data.filename}`);
});

ftpDeploy.on('uploaded', function (data) {
    // Clear the line after upload completes
});

ftpDeploy.on('log', function (data) {
    // Suppress verbose logs
});
