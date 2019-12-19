<template>
    <div class="row">
        <portal to="title">
            <app-title icon="mail-bulk">Edit Mailable</app-title>
        </portal>

        <portal to="actions">
            <router-link :to="{ name: 'mailables' }" class="button mr-3">Go Back</router-link>
            <button type="submit" @click.prevent="submit" class="button button--primary">Save Form</button>
        </portal>

        <div class="content-container">
            <form @submit.prevent="submit" @input.once="form.onFirstChange">
                <p-card>
                    <div class="row">
                        <div class="col form-content">
                            <div class="row">
                                <div class="col w-full xxl:w-1/2 mb-6">
                                    <p-input
                                        name="name"
                                        label="Name"
                                        help="What this mailable will be called."
                                        autocomplete="off"
                                        autofocus
                                        required
                                        :has-error="form.errors.has('name')"
                                        :error-message="form.errors.get('name')"
                                        v-model="form.name">
                                    </p-input>
                                </div>

                                <div class="col w-full xxl:w-1/2 mb-6">
                                    <p-slug
                                        name="handle"
                                        label="Handle"
                                        help="A developer-friendly variant of the mailable's name."
                                        autocomplete="off"
                                        required
                                        delimiter="_"
                                        :watch="form.name"
                                        :has-error="form.errors.has('handle')"
                                        :error-message="form.errors.get('handle')"
                                        v-model="form.handle">
                                    </p-slug>
                                </div>

                                <div class="col w-full xxl:w-1/2 mb-6">
                                    <markdown-field
                                        v-if="ready"
                                        ref="markdown"
                                        v-on:input="updateMarkdown"
                                        :field="{
                                            'name': 'Content',
                                            'handle': 'markdown'
                                        }"
                                        :value="form.markdown">
                                    </markdown-field>
                                </div>
                            </div>
                        </div>
                    </div>
                </p-card>
            </form>
        </div>

        <div class="side-container">
            <p-card>
                <div class="row">
                    <div class="col w-full">
                        <p-select
                            name="status"
                            label="Status"
                            :options="[
                                {
                                    'label': 'Enabled',
                                    'value': '1',
                                },
                                {
                                    'label': 'Disabled',
                                    'value': '0',
                                },
                            ]"
                            v-model="form.status">
                        </p-select>
                    </div>
                </div>
            </p-card>

            <p-card class="mt-5">
                <div class="row">
                    <div class="col w-full">
                        <label class="form__label">Placeholders</label>

                        <p-dropdown v-for="(items, key) in placeholders" :key="key">
                            {{ key }}

                            <template slot="options">
                                <p-dropdown-item v-for="(item, key) in items" :key="key" @click="addPlaceholder(item)">
                                    {{ item }}
                                </p-dropdown-item>
                            </template>
                        </p-dropdown>
                    </div>
                </div>
            </p-card>
        </div>
    </div>
</template>

<script>
    import Form from '../../forms/Form'
    import MarkdownField from '../../fieldtypes/Markdown/Field'

	export default {
		head: {
            title() {
                return {
                    inner: this.form.name || 'Loading...'
                }
            }
        },

        components: {
            'markdown-field': MarkdownField
        },

		data() {
            return {
                id: null,
                ready: false,
                placeholders: {},
                form: new Form({
                    name: '',
                    handle: '',
                    markdown: '',
                    status: '1'
                }, true)
            }
        },

        methods: {
            addPlaceholder(value) {
                const codemirror = this.$refs.markdown.codemirror
                const doc        = codemirror.getDoc()
                const cursor     = doc.getCursor()

                doc.replaceSelection(value, doc.getSelection())
            },

            updateMarkdown(markdown) {
                this.form.markdown = markdown
            },

            submit() {
                this.form.patch('/api/mailables/' + this.id).then((response) => {
                    toast('Mailable successfully updated', 'success')

                    this.$router.push('/mailables')
                }).catch((response) => {
                    toast(response.response.data.message, 'failed')
                })
            }
        },

        beforeRouteEnter(to, from, next) {
            axios.all([
                axios.get(`/api/mailables/${to.params.mailable}`),
            ]).then(axios.spread(function (mailable) {
                next(function(vm) {
                    vm.id    = mailable.data.data.id
                    vm.ready = true

                    vm.form.name     = mailable.data.data.name
                    vm.form.handle   = mailable.data.data.handle
                    vm.form.markdown = mailable.data.data.markdown
                    vm.form.resetChangeListener()

                    _.forEach(mailable.data.data.placeholders, (values, key) => {
                        let group = []

                        _.forEach(values, (value) => {
                            group.push(`{{ \$${key}->${value} }}`)
                        })
                        vm.placeholders[key] = group
                    })

                    vm.$emit('updateHead')
                })
           	})).catch(function(error) {
                next('/mailables')
                toast('The requested mailable could not be found', 'warning')
            })
        }
	}
</script>

<style>
    .dropdown__options {
        @apply w-full
    }
</style>