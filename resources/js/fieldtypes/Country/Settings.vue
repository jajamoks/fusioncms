<template>
    <div>
        <p-select
            name="settings.multiple"
            label="Multi Select"
            help="Should this field allow multiple options to be selected?"
            autocomplete="off"
            v-model="value.multiple"
            :options="[
                {
                    label: 'No',
                    value: 0,
                },
                {
                    label: 'Yes',
                    value: 1,
                }
            ]"
        >
        </p-select>
    </div>
</template>

<script>
    import fieldtype from '../../mixins/fieldtype'

    export default {
        name: 'country-fieldtype-settings',

        mixins: [fieldtype]
    }
</script>