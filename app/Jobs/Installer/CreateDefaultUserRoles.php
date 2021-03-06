<?php

/*
 * This file is part of the FusionCMS application.
 *
 * (c) efelle creative <appdev@efelle.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Jobs\Installer;

use Shinobi;
use Caffeinated\Shinobi\Models\Role;

class CreateDefaultUserRoles
{
    /**
     * @var array
     */
    protected $container;

    /**
     * @var array
     */
    protected $roles = [
        'guest' => [
            'name'        => 'Guest',
            'description' => 'All guests of the website will be assigned this role automatically.',
            'special'     => null,
            'permissions' => [],
        ],
        'user' => [
            'name'        => 'User',
            'description' => 'Users have limited access to the website. They can not access the admin backend or change any of its settings.',
            'special'     => null,
            'permissions' => [],
        ],
        'admin' => [
            'name'        => 'Administrator',
            'description' => 'Administrators have full control over the website and can change all website settings, users, roles, and their permissions.',
            'special'     => 'all-access',
            'permissions' => ['access.admin'],
        ],
    ];

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(array $container)
    {
        $this->container = $container;
    }

    /**
     * Execute the command.
     *
     * @return void
     */
    public function handle()
    {
        foreach ($this->roles as $slug => $value) {
            $role = Role::create([
                'name'        => $value['name'],
                'slug'        => $slug,
                'description' => $value['description'],
                'special'     => $value['special'],
            ]);

            Shinobi::give($value['permissions'] ?? [])->to($role);
        }
    }
}
