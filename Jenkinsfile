import java.text.SimpleDateFormat

def helmLint(String chart_dir) {
    // lint helm chart
    sh "/usr/local/bin/helm lint ${chart_dir}"
}

def helmDeploy(Map args) {
    //configure helm client and confirm tiller process is installed
    if(args.context == 'arn:aws:eks:us-east-1:116656244864:cluster/mycheckout-cluster-prod' || args.context == 'arn:aws:eks:us-east-1:116656244864:cluster/mycheckout-cluster-qa'){
        if (args.dry_run) {
            println "Running dry-run deployment"
            sh "helm upgrade -i ${args.name} ${args.chart_dir} -f ${args.chart_dir}/values.${args.stage}.yaml --set image.tag=${args.image_tag} --kube-context ${args.context} --dry-run --debug"
        } else {
            println "Running deployment"
            sh "kubectl config use-context ${args.context}"
            sh "kubectl apply -f ${args.chart_dir}/configmap.${args.stage}.yaml"
            sh "helm upgrade -i ${args.name} ${args.chart_dir} -f ${args.chart_dir}/values.${args.stage}.yaml --set image.tag=${args.image_tag} --kube-context ${args.context}"
            echo "Application ${args.name} successfully deployed. Use helm status ${args.name} to check"
        }
    } else {
        println "Context not set"
    }
}

docker.withRegistry('116656244864.dkr.ecr.us-east-1.amazonaws.com') {
    stage('checkout'){
        checkout scm
    }

    stage('docker login'){
        sh "aws --region us-east-1 ecr get-login-password | docker login --password-stdin --username AWS \"116656244864.dkr.ecr.us-east-1.amazonaws.com\""
    }

    namespace = "default"

    def chart_dir = "./charts/payment-api"

    config_file = chart_dir + "/values.yaml"
    def config = readYaml file: config_file

    def ecr_image_path = config.image.repository
    def split = ecr_image_path

    def project_name = ecr_image_path
    def project_name2 = 'payment-api'

    def release_name = project_name
    def date = new Date()
    sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss")
    env.TIMESTAMP = sdf.format(date)

    env.KUBE_CONTEXT = 'arn:aws:eks:us-east-1:116656244864:cluster/mycheckout-cluster-prod'
    env.STAGE = 'prod'

    if(env.BRANCH_NAME == 'main')
    {
        env.KUBE_CONTEXT = 'arn:aws:eks:us-east-1:116656244864:cluster/mycheckout-cluster-prod'
        env.STAGE = 'prod'
    }

    if(env.BRANCH_NAME == 'staging')
    {
        env.KUBE_CONTEXT = 'arn:aws:eks:us-east-1:116656244864:cluster/mycheckout-cluster-qa'
        env.STAGE = 'qa'
    }

    def image_name = project_name
    def image_tag = env.BRANCH_NAME == 'main' ? '${BUILD_NUMBER}-prod' : '${BUILD_NUMBER}-${BRANCH_NAME}'
    def image_tag_lagest = env.BRANCH_NAME == 'main' ? 'latest-prod' : 'latest-${BRANCH_NAME}'
    stage('build'){
        sh "docker build -t " + image_name + ':' + image_tag + " -f Dockerfile ."
    }
    stage('tag'){
        sh "docker tag " + image_name + ':' + image_tag + " " + image_name + ':' + image_tag
    }
    stage('push ecr'){
        sh "docker push " + image_name + ':' + image_tag
    }

    stage ('helm test') {
      // run helm chart linter
      helmLint(chart_dir)

      // run dry-run helm chart installation
      helmDeploy(
        dry_run       : true,
        name          : project_name2,
        chart_dir     : chart_dir,
        context       : env.KUBE_CONTEXT,
        namespace     : env.BRANCH_NAME,
        stage         : env.STAGE,
        project_name  : project_name2,
        image_name    : image_name,
        image_tag     : image_tag
       )
    }
    stage ('helm deploy') {
      // Deploy using Helm chart
      helmDeploy(
        dry_run       : false,
        name          : project_name2,
        chart_dir     : chart_dir,
        context       : env.KUBE_CONTEXT,
        namespace     : env.BRANCH_NAME,
        stage         : env.STAGE,
        project_name  : project_name2,
        image_name    : image_name,
        image_tag     : image_tag
      )
    }
}
