<template>
    <div>
        <portal to="title">
            <app-title :icon="collection.icon || 'pencil-alt'">Edit {{ collection.reference_singular }}</app-title>
        </portal>
        
        <portal to="subtitle">{{ collection.description }}</portal>

        <div class="row">
            <div class="content-container">
                <form @submit.prevent="submit">
                    <p-card>
                        <div class="row" v-if="collection.show_name_field">
                            <div class="col form-sidebar">
                                <div class="xxl:mr-10">
                                    <!--  -->
                                </div>
                            </div>

                            <div class="col mb-6 form-content">
                                <div class="row">
                                    <div class="col w-1/2">
                                        <p-input
                                            name="name"
                                            :label="collection.name_label || 'Name'"
                                            autocomplete="off"
                                            autofocus
                                            required
                                            :has-error="form.errors.has('name')"
                                            :error-message="form.errors.get('name')"
                                            v-model="form.name">
                                        </p-input>
                                    </div>

                                    <div class="col w-1/2">
                                        <p-slug
                                            name="slug"
                                            label="Slug"
                                            monospaced
                                            autocomplete="off"
                                            required
                                            :watch="form.name"
                                            :has-error="form.errors.has('slug')"
                                            :error-message="form.errors.get('slug')"
                                            v-model="form.slug">
                                        </p-slug>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="sections.body.length > 0" :key="collection.slug">
                            <!-- Loop through each section -->
                            <div v-for="(section, index) in sections.body" :key="section.handle">
                                <div class="row">
                                    <div class="col form-sidebar">
                                        <div class="xxl:mr-10">
                                            <h3>{{ section.name }}</h3>
                                            <p class="text-sm">{{ section.description }}</p>
                                        </div>
                                    </div>

                                    <div class="col form-content">
                                        <!-- Loop through each section field -->
                                        <div v-for="field in section.fields" :key="field.handle" class="form__group">
                                            <component
                                                :is="field.type.id + '-fieldtype'"
                                                :field="field"
                                                v-model="form[field.handle]"
                                            >
                                            </component>
                                        </div>
                                    </div>
                                </div>
                            
                                <hr v-if="index !== sections.body.length - 1">
                            </div>
                        </div>

                        <div v-else class="text-center">
                            <p>You should configure your Matrix Collection with some sections and fields first <fa-icon class="text-emoji" :icon="['fas', 'hand-peace']"></fa-icon></p>

                            <router-link class="button items-center" :to="'/matrices/manage/' + collection.id"><fa-icon :icon="['fas', 'edit']" class="mr-2 text-sm"></fa-icon> Manage your collection</router-link>
                        </div>
                    </p-card>
                </form>
            </div>

            <div class="side-container">
                <form @submit.prevent="submit">
                    <p-card>
                        <div class="row">
                            <div class="col w-full">
                                <p-select
                                    name="status"
                                    label="Status"
                                    :options="[
                                        {
                                            'label': 'Enabled',
                                            'value': 1,
                                        },
                                        {
                                            'label': 'Disabled',
                                            'value': 0,
                                        },
                                    ]"
                                    v-model="form.status"
                                    >
                                </p-select>
                            </div>
                        </div>

                        <portal to="actions">
                            <router-link v-if="collection.slug" :to="{ name: 'entries.index', params: {collection: collection.slug} }" class="button mr-3">Go Back</router-link>

                            <button type="submit" @click.prevent="submit" class="button button--primary" :class="{'button--disabled': !form.hasChanges}" :disabled="!form.hasChanges">Save</button>
                        </portal>
                    </p-card>

                    <p-card v-for="(section) in sections.sidebar" :key="section.handle" class="mt-6">
                        <h3>{{ section.name }}</h3>
                        <p class="text-sm">{{ section.description }}</p>

                        <div class="w-full">
                            <!-- Loop through each section field -->
                            <div v-for="field in section.fields" :key="field.handle" class="form__group">
                                <component
                                    :is="field.type.id + '-fieldtype'"
                                    :field="field"
                                    v-model="form[field.handle]"
                                >
                                </component>
                            </div>
                        </div>
                    </p-card>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import Form from '../../forms/Form'

    export default {
        head: {
            title() {
                return {
                    inner: this.entry.name || 'Loading...'
                }
            }
        },

        data() {
            return {
                collection: {},
                entry: {},
                form: new Form({}),
            }
        },

        computed: {
            sections() {
                let body = []
                let sidebar = []

                if (this.collection.fieldset) {
                    body = _.filter(this.collection.fieldset.sections, function(section) {
                        return section.placement == 'body'
                    })

                    sidebar = _.filter(this.collection.fieldset.sections, function(section) {
                        return section.placement == 'sidebar'
                    })
                }

                return {
                    body: body,
                    sidebar: sidebar
                }
            },
        },

        methods: {
            submit() {
                this.form.patch('/api/collections/' + this.collection.slug + '/' + this.entry.id).then((response) => {
                    toast('Entry saved successfully', 'success')
                    
                    this.$router.push('/collections/' + this.collection.slug)
                }).catch((response) => {
                    toast(response.response.data.message, 'failed')
                })
            },

            getEntry(to, from, next) {
                let vm = this

                axios.get('/api/collections/' + to.params.collection + '/' + to.params.id).then((response) => {
                    vm.collection = response.data.data.matrix
                    vm.entry = response.data.data.entry

                    let fields = {
                        name: vm.entry.name,
                        slug: vm.entry.slug,
                        status: vm.entry.status,
                    }

                    if (vm.collection.fieldset) {
                        _.forEach(vm.collection.fieldset.sections, function(section) {
                            _.forEach(section.fields, function(field) {
                                if (vm.entry[field.handle + '_raw']) {
                                    Vue.set(fields, field.handle, vm.entry[field.handle + '_raw'])
                                } else {
                                    Vue.set(fields, field.handle, vm.entry[field.handle])
                                }
                            })
                        })
                    }

                    vm.form = new Form(fields, true)

                    vm.$emit('updateHead')
                }).catch(function(error) {
                    vm.$router.push('/collections/' + vm.$router.currentRoute.params.collection)
                    toast('The requested entry could not be found', 'warning')
                })
            },
        },

        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.getEntry(to, from, next)
            })
        },

        beforeRouteUpdate(to,from,next) {
            this.getEntry(to, from, next)
            
            next()
        }
    }
</script>