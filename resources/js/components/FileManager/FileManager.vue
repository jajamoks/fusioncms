<template>
    <div class="file-manager__wrap" @dragenter="setDropzoneVisible(true)">
        <file-uploader ref="uploader"></file-uploader>
        
        <portal to="actions" v-if="! inline">

            <div class="inline-block mr-4" v-show="hasSelection">
                <div class="inline-block mr-4">
                    <p-button v-modal:delete theme="danger">Delete</p-button>
                </div>
                
                <p-button @click.prevent="clearSelection">Uncheck All</p-button>
                <p-button v-modal:move-file>Move</p-button>
                <p-button v-if="singleSelection" v-modal:rename-file>Rename</p-button>
            </div>

            <div class="inline-block">
                <p-button v-modal:new-folder>New Folder</p-button>
            </div>

            <div class="inline-block ml-4">
                <p-button @click.prevent="toggleView"> {{ (view === 'list' ? 'View Grid' : 'View List') }}</p-button>
                <p-button theme="primary" @click="$refs.uploader.openDZ()">Upload</p-button>
            </div>
        </portal>

        <div class="row">
            <div class="side-container">
                <p-card>
                    <p-input name="search" placeholder="Search" v-model="search"></p-input>

                    <div class="list">
                        <span class="list--separator">Display</span>
                        
                        <a href="#" @click.prevent="filterBy('everything')" class="list--item leading-loose" :class="{'router-link-active': isFilteringBy('everything')}"><fa-icon class="fa-fw mr-2" :icon="['fas', 'asterisk']"></fa-icon> Everything</a>
                        <a href="#" @click.prevent="filterBy('images')" class="list--item leading-loose" :class="{'router-link-active': isFilteringBy('images')}"><fa-icon class="fa-fw mr-2" :icon="['fas', 'images']"></fa-icon> Images</a>
                        <a href="#" @click.prevent="filterBy('videos')" class="list--item leading-loose" :class="{'router-link-active': isFilteringBy('videos')}"><fa-icon class="fa-fw mr-2" :icon="['fas', 'video']"></fa-icon> Videos</a>
                        <a href="#" @click.prevent="filterBy('audio')" class="list--item leading-loose" :class="{'router-link-active': isFilteringBy('audio')}"><fa-icon class="fa-fw mr-2" :icon="['fas', 'volume-up']"></fa-icon> Audio</a>
                        <a href="#" @click.prevent="filterBy('documents')" class="list--item leading-loose" :class="{'router-link-active': isFilteringBy('documents')}"><fa-icon class="fa-fw mr-2" :icon="['fas', 'file-alt']"></fa-icon> Documents</a>

                        <span class="list--separator">Sort</span>
                        
                        <a href="#" @click.prevent="sortBy('name')" class="list--item leading-loose" :class="{'router-link-active': isSortingBy('name')}"><fa-icon class="fa-fw mr-2" :icon="['fas', sortingIcon('name')]"></fa-icon> Name</a>
                        <a href="#" @click.prevent="sortBy('bytes')" class="list--item leading-loose" :class="{'router-link-active': isSortingBy('bytes')}"><fa-icon class="fa-fw mr-2" :icon="['fas', sortingIcon('bytes')]"></fa-icon> Filesize</a>
                        <a href="#" @click.prevent="sortBy('updated_at')" class="list--item leading-loose" :class="{'router-link-active': isSortingBy('updated_at')}"><fa-icon class="fa-fw mr-2" :icon="['fas', sortingIcon('updated_at')]"></fa-icon> Last Modified</a>

                        <!-- File Tree Explorer -->

                        <!-- <div v-if="directories.length">
                            <span class="list--separator">Locations</span>

                            <div class="list--item">
                                <p-treeview :items="directories" v-model="selected">
                                    <template slot="prepend" slot-scope="{ node, open }">
                                        <fa-icon v-if="open && ! node.file" :icon="node.icon || ['fas', 'folder-open']" class="fa-fw mr-2"></fa-icon>
                                        <fa-icon v-if="! open && ! node.file" :icon="node.icon || ['fas', 'folder']" class="fa-fw mr-2"></fa-icon>
                                    </template>
                                </p-treeview>
                            </div>
                        </div> -->
                    </div>
                </p-card>
            </div>

            <div class="content-container">
                <div class="card">
                    <div class="border-b border-gray-200 px-8 py-2 text-gray-800 flex items-center">
                        <span class="mr-2">
                            <fa-icon :icon="['fas', 'server']" class="fa-fw"></fa-icon> Local
                        </span>

                        <!-- Folder Root Navigation -->

                        <!-- <span class="mr-2">
                            <fa-icon :icon="['fas', 'chevron-right']" class="mr-1"></fa-icon> Folder
                        </span> -->
                    </div>

                    <component :is="view + '-view'"/>

                    <div class="card__body text-right" v-if="totalPages > 1">
                        <p-pagination
                            @input="setCurrentPage($event)"
                            :total="totalPages"
                            :value="currentPage"
                            :max-visible-pages="3">
                        </p-pagination>
                    </div>
                </div>
            </div>
        </div>

        <portal to="modals">
            <new-folder-modal></new-folder-modal>
            <move-file-modal></move-file-modal>
            <rename-file-modal :selection="singleSelection"></rename-file-modal>
            <delete-selected-files-modal></delete-selected-files-modal>
        </portal>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import FileUploader from './FileUploader.vue'
    import GridView from './Views/Grid.vue'
    import ListView from './Views/List.vue'

    export default {
        name: 'file-manager',

        components: {
            'file-uploader': FileUploader,
            'grid-view': GridView,
            'list-view': ListView,
        },

        props: {
            inline: {
                type: Boolean,
                default: false,
            },
        },

        computed: {
            ...mapGetters({
                selectedDirectories: 'filemanager/getSelectedDirectories',
                selectedFiles: 'filemanager/getSelectedFiles',
                currentPage: 'filemanager/getCurrentPage',
                fileUploads: 'filemanager/getFileUploads',
                directories: 'filemanager/getDirectories',
                hasSelection: 'filemanager/hasSelection',
                totalPages: 'filemanager/getTotalPages',
                direction: 'filemanager/getDirection',
                display: 'filemanager/getDisplay',
                loading: 'filemanager/getLoading',
                files: 'filemanager/getFiles',
                sort: 'filemanager/getSort',
                view: 'filemanager/getView',
            }),

            search: {
                get() {
                    return this.$store.state.filemanager.search
                },

                set(value) {
                    this.$store.commit('filemanager/setSearch', value)
                }
            },

            singleSelection() {
                if (this.selectedDirectories.length == 1 && this.selectedFiles.length == 0) {
                    return _.find(this.directories, ['id', this.selectedDirectories[0]])
                }
                else if (this.selectedDirectories.length == 0 && this.selectedFiles.length == 1) {
                    return _.find(this.files, ['id', this.selectedFiles[0]])
                }

                return false
            },
        },

        watch: {
            display(value) {
                this.fetchFilesAndDirectories()
            },

            sort(value) {
                this.fetchFilesAndDirectories()
            },

            search(value) {
                this.fetchFilesAndDirectories()
            },

            direction(value) {
                this.fetchFilesAndDirectories()
            },

            currentPage(value) {
                this.fetchFilesAndDirectories()
            },
        },

        methods: {
            ...mapActions({
                fetchFilesAndDirectories: 'filemanager/fetchFilesAndDirectories',
                clearDirectorySelection: 'filemanager/clearDirectorySelection',
                setUploadsMinimized: 'filemanager/setUploadsMinimized',
                setDropzoneVisible: 'filemanager/setDropzoneVisible',
                clearFileSelection: 'filemanager/clearFileSelection',
                setUploadProgress: 'filemanager/setUploadProgress',
                setUploadsVisible: 'filemanager/setUploadsVisible',
                toggleDirection: 'filemanager/toggleDirection',
                setCurrentPage: 'filemanager/setCurrentPage',
                setFileUploads: 'filemanager/setFileUploads',
                addFileUpload: 'filemanager/addFileUpload',
                setDirection: 'filemanager/setDirection',
                setDisplay: 'filemanager/setDisplay',
                toggleView: 'filemanager/toggleView',
                setFiles: 'filemanager/setFiles',
                addFile: 'filemanager/addFile',
                setSort: 'filemanager/setSort',                
            }),

            isFilteringBy(what) {
                return what === this.display
            },

            isSortingBy(what) {
                return what === this.sort
            },

            clearSelection() {
                this.clearFileSelection()
                this.clearDirectorySelection()
            },

            filterBy(filter) {
                this.setDisplay(filter)
            },

            sortBy(key) {
                if (this.sort === key) {
                    this.toggleDirection()
                } else {
                    this.setSort(key)
                    this.setDirection('asc')
                }
            },

            preview(id) {
                console.log('previewing ' + id)
            },

            bytes(bytes) {
                let thresh = 1000

                if (Math.abs(bytes) < thresh) {
                    return bytes + ' B'
                }

                let index = -1
                let units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
                
                do {
                    bytes /= thresh
                    ++index
                } while (Math.abs(bytes) >= thresh && index < units.length - 1)

                return bytes.toFixed(1) + ' ' + units[index]
            },

            lastModified(timestamp) {
                return this.$moment(timestamp).format('MMM Do, YYYY')
            },

            sortingIcon(by) {
                if (by === this.sort) {
                    if (this.direction === 'asc') {
                        return 'sort-amount-down'
                    } else {
                        return 'sort-amount-up'
                    }
                }

                return 'bars'
            }
        }
    }
</script>

<style>
    .gallery-container {
        /* Disable text selection */
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
    }

    .dropzone-highlight {
        animation: pulse 1s infinite;
    }

    .dropzone-over {
        border-color: rgba(255, 87, 34, 0.5);
    }

    .draggable-mirror {
        border: 2px solid rgba(255, 87, 34, 0.25);
        background-color: rgba(255, 87, 34, 0.10);
    }

    @keyframes pulse {
      0%   { border-color: rgba(255, 87, 34, 0.0); }
      50%  { border-color: rgba(255, 87, 34, 1.0); }
      100% { border-color: rgba(255, 87, 34, 0.0); }
    }
</style>