<template>
    <div>
        <portal to="title">
			<app-title icon="paper-plane">Edit Form</app-title>
		</portal>

        <shared-form :form="form" :submit="submit" :id="id" :fieldset="fieldset" @sectionBuilderInput="sectionChange()"></shared-form>
    </div>
</template>

<script>
    import Form from '../../forms/Form'
    import SharedForm from './SharedForm'

    export default {
        head: {
            title() {
                return {
                    inner: this.form.name || 'Loading...'
                }
            }
        },

        data() {
            return {
                id: null,
                fieldset: null,
                form: new Form({
                    name: '',
                    handle: '',
                    description: '',

                    fieldset: {},
                    
                    collect_email_addresses: false,
                    collect_ip_addresses: false,
                    response_receipt: false,
                    
                    message: '',
                    redirect_on_submission: false,
                    redirect_url: '',

                    enable_recaptcha: false,
                    enable_honeypot: false,
                    
                    send_to: '',
                    reply_to: '',
                    
                    form_template: '',
                    thankyou_template: '',
                    
                    status: true,
                }, true)
            }
        },

        components: {
            'shared-form': SharedForm
        },

        methods: {
            submit() {
                let fieldsetForm = {}
                fieldsetForm.sections = this.form.fieldset.sections

                axios.post(`/api/fieldsets/${this.form.fieldset.id}/sections`, fieldsetForm).then((response) => {
                    this.form.patch('/api/forms/' + this.id).then((response) => {
                        toast('Form successfully saved', 'success')

                        this.$router.push('/forms')
                    }).catch((response) => {
                        toast(response.message, 'failed')
                    })
                })                
            },

            sectionChange() {
                if (!this.form.hasChanges) {
                    this.form.onFirstChange()
                }
            }
        },

        beforeRouteEnter(to, from, next) {
            axios.all([
                axios.get('/api/forms/' + to.params.form),
            ]).then(axios.spread(function (form) {
                next(function(vm) {
                    vm.id = form.data.data.id

                    vm.form.name = form.data.data.name
                    vm.form.handle = form.data.data.handle
                    vm.form.description = form.data.data.description

                    vm.form.fieldset = form.data.data.fieldset
                    
                    vm.form.collect_email_addresses = form.data.data.collect_email_addresses
                    vm.form.collect_ip_addresses = form.data.data.collect_ip_addresses
                    vm.form.response_receipt = form.data.data.response_receipt
                    
                    vm.form.message = form.data.data.message
                    vm.form.redirect_on_submission = form.data.data.redirect_on_submission
                    vm.form.redirect_url = form.data.data.redirect_url

                    vm.form.enable_recaptcha = form.data.data.enable_recaptcha
                    vm.form.enable_honeypot = form.data.data.enable_honeypot
                    
                    vm.form.send_to = form.data.data.send_to
                    vm.form.reply_to = form.data.data.reply_to
                    
                    vm.form.form_template = form.data.data.form_template
                    vm.form.thankyou_template = form.data.data.thankyou_template
                    
                    vm.form.status = form.data.data.status

                    vm.$emit('updateHead')

                    vm.$nextTick(function(){
                        vm.form.resetChangeListener()
                    })
                })
            }))
        },
    }
</script>